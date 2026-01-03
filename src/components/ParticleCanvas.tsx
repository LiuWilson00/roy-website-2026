/**
 * ParticleCanvas - 粒子系統主渲染組件
 * 支援滾動驅動的 Stage 切換與過渡效果
 */

import { useRef, useState, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

import { useParticleSystem, type TrailPoint } from '../hooks/useParticleSystem'
import { useMousePosition } from '../hooks/useMousePosition'
import CoreGlow from './CoreGlow'
import {
  stage0Transform,
  getBreathRadius,
  stage1Transform,
  getLayerColor,
  stage0SceneState,
  stage1SceneState,
} from '../particles/transforms'
import { interpolateState, interpolateSceneState } from '../particles/interpolation'
import {
  calculateHoverOffset,
  calculateRippleStrength,
  calculateMagneticRepulsion,
  calculateRippleWaveOffset,
  calculateCoreInteraction,
  INTERACTION_CONFIG,
  type RippleWaveState,
} from '../particles/interactions'
import { lerpFromWhite, easeInOutCubic, cycleFromWhite, cycleColors } from '../utils/math'
import type { TransformContext, Point, ParticleState, StageTransform, SceneState, SceneTransform } from '../particles/types'

// 註冊 ScrollTrigger
gsap.registerPlugin(ScrollTrigger)

// Stage 配置
interface StageDefinition {
  id: number
  name: string
  transform: StageTransform
  sceneState: SceneTransform
}

const STAGES: StageDefinition[] = [
  { id: 0, name: 'circle', transform: stage0Transform, sceneState: stage0SceneState },
  { id: 1, name: 'bloom', transform: stage1Transform, sceneState: stage1SceneState },
]

export default function ParticleCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const dotsRef = useRef<(SVGCircleElement | null)[]>([])
  const glowRef = useRef<SVGFEGaussianBlurElement>(null)
  const glowIntensityRef = useRef<SVGFEGaussianBlurElement>(null)
  const pulseValueRef = useRef(0) // 脈動值 0-1

  // 滾動進度 (0 = Stage 0, 1 = Stage 1, etc.)
  const scrollProgressRef = useRef(0)

  // 粒子系統
  const { particles, triggerRipple, getClickOffset, recordPosition, getTrailPoints } = useParticleSystem({
    count: 80,
    baseRadius: 180,
  })

  // 拖尾 refs
  const trailGroupsRef = useRef<(SVGGElement | null)[]>([])
  const mainGroupRef = useRef<SVGGElement>(null)
  const glowOverlayRef = useRef<SVGGElement>(null)
  const glowDotsRef = useRef<(SVGCircleElement | null)[]>([])

  // 滑鼠位置追蹤
  const mouseRef = useMousePosition(stickyRef as React.RefObject<HTMLElement>)

  // 畫布中心
  const [center, setCenter] = useState<Point>({ x: 0, y: 0 })

  // 場景狀態
  const [sceneState, setSceneState] = useState<SceneState | null>(null)
  const timeRef = useRef(0)

  // Stage 1 波紋狀態
  const rippleWaveRef = useRef<RippleWaveState>({
    x: 0,
    y: 0,
    startTime: 0,
    active: false,
  })

  // 光核互動強度
  const coreInteractionRef = useRef(0)

  // 更新畫布中心
  useEffect(() => {
    const updateCenter = () => {
      if (stickyRef.current) {
        const rect = stickyRef.current.getBoundingClientRect()
        setCenter({ x: rect.width / 2, y: rect.height / 2 })
      }
    }
    updateCenter()
    window.addEventListener('resize', updateCenter)
    return () => window.removeEventListener('resize', updateCenter)
  }, [])

  /**
   * 根據滾動進度計算粒子狀態
   * 支援兩個 Stage 之間的平滑過渡
   */
  const computeParticleState = (
    particleIndex: number,
    context: TransformContext
  ): ParticleState => {
    const particle = particles[particleIndex]
    const progress = scrollProgressRef.current

    // 計算當前在哪兩個 Stage 之間
    const stageIndex = Math.floor(progress)
    const stageProgress = progress - stageIndex

    const currentStage = STAGES[Math.min(stageIndex, STAGES.length - 1)]
    const nextStage = STAGES[Math.min(stageIndex + 1, STAGES.length - 1)]

    // 獲取兩個 Stage 的狀態
    const currentState = currentStage.transform(particle, context)
    const nextState = nextStage.transform(particle, context)

    // 插值過渡
    let baseState: ParticleState
    if (stageIndex >= STAGES.length - 1 || stageProgress === 0) {
      baseState = currentState
    } else {
      baseState = interpolateState(currentState, nextState, stageProgress)
    }

    // Stage 0 互動效果（接近 Stage 0 時應用，逐漸減弱）
    const stage0Strength = Math.max(0, 1 - progress * 2)

    if (stage0Strength > 0) {
      const breathRadius = getBreathRadius(context.time)
      const clickOffset = getClickOffset(particleIndex) * stage0Strength
      const hoverOffset = calculateHoverOffset(
        particle,
        context.time,
        context.mouse,
        context.center,
        breathRadius + clickOffset
      ) * stage0Strength

      const totalOffset = clickOffset + hoverOffset
      baseState = {
        ...baseState,
        x: baseState.x + Math.cos(particle.theta) * totalOffset,
        y: baseState.y + Math.sin(particle.theta) * totalOffset,
      }
    }

    // Stage 1 互動效果（進入 Stage 1 後啟用）
    const stage1Strength = Math.min(1, Math.max(0, progress - 0.3) / 0.7)

    if (stage1Strength > 0) {
      // Effect A: 磁力排斥
      const repulsion = calculateMagneticRepulsion(
        { x: baseState.x, y: baseState.y },
        context.mouse
      )
      baseState.x += repulsion.dx * stage1Strength
      baseState.y += repulsion.dy * stage1Strength

      // Effect D: 點擊波紋
      const rippleOffset = calculateRippleWaveOffset(
        { x: baseState.x, y: baseState.y },
        rippleWaveRef.current,
        context.time
      )
      baseState.x += rippleOffset.dx * stage1Strength
      baseState.y += rippleOffset.dy * stage1Strength

      // 波紋時粒子發光增強
      if (rippleOffset.intensity > 0) {
        baseState.glow = (baseState.glow || 5) * (1 + rippleOffset.intensity * 0.5)
      }
    }

    // 動態循環顏色（每個粒子有不同的相位偏移）
    // 使用 theta 作為偏移，讓相鄰粒子有相近但不同的顏色
    const colorOffset = particle.theta / (Math.PI * 2) // 0-1 基於角度位置

    // 使用 easing 讓顏色過渡更自然
    const colorProgress = easeInOutCubic(Math.min(progress, 1))

    // 從白色漸變到循環顏色，週期 8 秒
    baseState.color = cycleFromWhite(context.time, colorOffset, colorProgress, 8)

    return baseState
  }

  /**
   * 計算場景狀態（中心光核等）
   */
  const computeSceneState = (context: TransformContext): SceneState => {
    const progress = scrollProgressRef.current

    // 計算當前在哪兩個 Stage 之間
    const stageIndex = Math.floor(progress)
    const stageProgress = progress - stageIndex

    const currentStage = STAGES[Math.min(stageIndex, STAGES.length - 1)]
    const nextStage = STAGES[Math.min(stageIndex + 1, STAGES.length - 1)]

    // 獲取兩個 Stage 的場景狀態
    const currentSceneState = currentStage.sceneState(context)
    const nextSceneState = nextStage.sceneState(context)

    // 插值過渡
    if (stageIndex >= STAGES.length - 1 || stageProgress === 0) {
      return currentSceneState
    }

    return interpolateSceneState(currentSceneState, nextSceneState, stageProgress)
  }

  /**
   * 更新所有粒子
   */
  const updateAllParticles = (time: number) => {
    if (center.x === 0) return

    const context: TransformContext = {
      time,
      mouse: mouseRef.current,
      center,
      scrollProgress: scrollProgressRef.current,
      stageProgress: scrollProgressRef.current % 1,
    }

    dotsRef.current.forEach((dot, i) => {
      if (!dot) return

      const state = computeParticleState(i, context)

      // 記錄位置（用於拖尾）
      recordPosition(i, state.x, state.y)

      // 更新主粒子
      dot.setAttribute('cx', String(state.x))
      dot.setAttribute('cy', String(state.y))
      dot.setAttribute('r', String(state.r))
      dot.setAttribute('opacity', String(state.opacity))
      dot.setAttribute('fill', state.color || 'white')

      // 更新光暈覆蓋層粒子位置和顏色
      const glowDot = glowDotsRef.current[i]
      if (glowDot) {
        // 光暈粒子跟隨主粒子，但大小會脈動
        const pulseSize = 6 + pulseValueRef.current * 4
        glowDot.setAttribute('cx', String(state.x))
        glowDot.setAttribute('cy', String(state.y))
        glowDot.setAttribute('r', String(pulseSize))
        // 光暈顏色也跟隨循環（使用完整飽和度）
        const glowColor = cycleColors(context.time, particles[i].theta / (Math.PI * 2), 8)
        glowDot.setAttribute('fill', glowColor)
      }

      // 更新拖尾
      const trailLength = state.trailLength ?? 0
      const trailGroup = trailGroupsRef.current[i]

      if (trailGroup && trailLength > 0) {
        const trails = getTrailPoints(i, trailLength, state.opacity, state.r)
        const circles = trailGroup.children

        // 更新現有 circle 或創建新的
        trails.forEach((trail, idx) => {
          let circle = circles[idx] as SVGCircleElement | undefined

          if (!circle) {
            circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
            trailGroup.appendChild(circle)
          }

          circle.setAttribute('cx', String(trail.x))
          circle.setAttribute('cy', String(trail.y))
          circle.setAttribute('r', String(trail.size))
          circle.setAttribute('opacity', String(trail.opacity))
          circle.setAttribute('fill', state.color || 'white')
        })

        // 移除多餘的 circles
        while (circles.length > trails.length) {
          trailGroup.removeChild(circles[circles.length - 1])
        }
      } else if (trailGroup) {
        // 無拖尾時清空
        while (trailGroup.firstChild) {
          trailGroup.removeChild(trailGroup.firstChild)
        }
      }
    })

    // 更新光暈強度（基於滾動進度）
    const progress = scrollProgressRef.current
    if (mainGroupRef.current) {
      // 在 Stage 1 使用更強的光暈
      const filterName = progress > 0.3 ? 'glow-intense' : 'glow'
      mainGroupRef.current.setAttribute('filter', `url(#${filterName})`)
    }

    // 更新光暈覆蓋層透明度（脈動效果）
    if (glowOverlayRef.current) {
      const pulseIntensity = pulseValueRef.current
      const glowOpacity = progress * 0.3 * (0.5 + pulseIntensity * 0.5)
      glowOverlayRef.current.setAttribute('opacity', String(glowOpacity))
    }

    // 更新場景狀態（中心光核等）
    const newSceneState = computeSceneState(context)
    setSceneState(newSceneState)
    timeRef.current = time

    // 計算光核互動強度 (Effect F)
    coreInteractionRef.current = calculateCoreInteraction(mouseRef.current, center)

    // 檢查波紋是否已結束
    if (rippleWaveRef.current.active) {
      const elapsed = time - rippleWaveRef.current.startTime
      if (elapsed > INTERACTION_CONFIG.rippleWave.duration) {
        rippleWaveRef.current.active = false
      }
    }
  }

  /**
   * 點擊處理
   */
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (center.x === 0) return

    const rect = stickyRef.current?.getBoundingClientRect()
    if (!rect) return

    const clickPoint: Point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }

    const progress = scrollProgressRef.current

    // Stage 0: 彈跳漣漪效果
    if (progress < 0.5) {
      const breathRadius = getBreathRadius(gsap.ticker.time)

      particles.forEach((particle, i) => {
        const currentRadius = breathRadius + getClickOffset(i)
        const strength = calculateRippleStrength(particle, clickPoint, center, currentRadius)

        if (strength > 0) {
          triggerRipple(i, strength, INTERACTION_CONFIG.ripple.duration)
        }
      })
    }

    // Stage 1: 波紋擴散效果 (Effect D)
    if (progress > 0.3) {
      rippleWaveRef.current = {
        x: clickPoint.x,
        y: clickPoint.y,
        startTime: gsap.ticker.time,
        active: true,
      }
    }
  }

  // 設置 ScrollTrigger
  useGSAP(() => {
    if (!containerRef.current) return

    ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      onUpdate: (self) => {
        // 將滾動進度映射到 Stage (0-1 = Stage 0→1)
        scrollProgressRef.current = self.progress * (STAGES.length - 1)
      },
    })

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, { scope: containerRef })

  // 主動畫循環
  useGSAP(() => {
    if (center.x === 0) return

    const ctx = gsap.context(() => {
      const tickHandler = () => {
        updateAllParticles(gsap.ticker.time)
      }
      gsap.ticker.add(tickHandler)

      // 基礎光暈呼吸動畫
      if (glowRef.current) {
        gsap.to(glowRef.current, {
          attr: { stdDeviation: 8 },
          duration: 4,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        })
      }

      // 強化光暈脈動動畫 - 更快的節奏
      if (glowIntensityRef.current) {
        gsap.to(glowIntensityRef.current, {
          attr: { stdDeviation: 15 },
          duration: 1.5,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        })
      }

      // 脈動值動畫（用於控制其他效果）
      const pulseObj = { value: 0 }
      gsap.to(pulseObj, {
        value: 1,
        duration: 2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        onUpdate: () => {
          pulseValueRef.current = pulseObj.value
        },
      })

      return () => {
        gsap.ticker.remove(tickHandler)
      }
    }, stickyRef)

    return () => ctx.revert()
  }, { scope: stickyRef, dependencies: [center, particles] })

  // 初始位置
  const getInitialPosition = (index: number) => {
    if (center.x === 0) return { x: 0, y: 0 }
    const particle = particles[index]
    return {
      x: center.x + Math.cos(particle.theta) * 180,
      y: center.y + Math.sin(particle.theta) * 180,
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative bg-black"
      style={{ height: '200vh' }} // 足夠的滾動空間
    >
      {/* Sticky 容器：固定在視窗中 */}
      <div
        ref={stickyRef}
        className="sticky top-0 w-full h-screen overflow-hidden cursor-pointer"
        onClick={handleClick}
      >
        {center.x > 0 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              {/* 基礎光暈濾鏡 */}
              <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur
                  ref={glowRef}
                  in="SourceGraphic"
                  stdDeviation="4"
                  result="blur"
                />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* 強化脈動光暈濾鏡 - 用於 Stage 1 */}
              <filter id="glow-intense" x="-150%" y="-150%" width="400%" height="400%">
                {/* 內層光暈 - 較小較亮 */}
                <feGaussianBlur
                  in="SourceGraphic"
                  stdDeviation="3"
                  result="blur1"
                />
                {/* 中層光暈 - 主要脈動層 */}
                <feGaussianBlur
                  ref={glowIntensityRef}
                  in="SourceGraphic"
                  stdDeviation="8"
                  result="blur2"
                />
                {/* 外層光暈 - 最大範圍 */}
                <feGaussianBlur
                  in="SourceGraphic"
                  stdDeviation="15"
                  result="blur3"
                />
                <feMerge>
                  <feMergeNode in="blur3" />
                  <feMergeNode in="blur2" />
                  <feMergeNode in="blur2" />
                  <feMergeNode in="blur1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* 額外的光暈覆蓋層（脈動效果） */}
            <g ref={glowOverlayRef} filter="url(#glow-intense)" opacity="0">
              {particles.map((particle, i) => {
                const pos = getInitialPosition(i)
                return (
                  <circle
                    key={`glow-${particle.id}`}
                    ref={(el) => { glowDotsRef.current[i] = el }}
                    cx={pos.x}
                    cy={pos.y}
                    r={6}
                    fill="white"
                  />
                )
              })}
            </g>

            {/* 中心光核 (Effect F) - 渲染在最底層 */}
            {sceneState?.core && (
              <CoreGlow
                state={sceneState.core}
                center={center}
                time={timeRef.current}
                interactionIntensity={coreInteractionRef.current}
              />
            )}

            {/* 主粒子層 */}
            <g ref={mainGroupRef} filter="url(#glow)">
              {/* 拖尾 groups（渲染在主粒子後面） */}
              {particles.map((particle, i) => (
                <g
                  key={`trail-${particle.id}`}
                  ref={(el) => { trailGroupsRef.current[i] = el }}
                />
              ))}

              {/* 主粒子 */}
              {particles.map((particle, i) => {
                const pos = getInitialPosition(i)
                return (
                  <circle
                    key={particle.id}
                    ref={(el) => { dotsRef.current[i] = el }}
                    cx={pos.x}
                    cy={pos.y}
                    r={3}
                    fill="white"
                  />
                )
              })}
            </g>
          </svg>
        )}

        {/* 標題 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <h1 className="text-white/10 font-mono text-2xl tracking-[0.3em] uppercase">
            Cyber Iris
          </h1>
        </div>

        {/* 底部提示 */}
        <div className="absolute bottom-10 w-full text-center text-gray-600 font-mono text-sm animate-pulse">
          SCROLL TO EXPLORE
        </div>

        {/* Debug: 顯示當前進度 */}
        <div className="absolute top-4 right-4 text-white/30 font-mono text-xs">
          Stage: {Math.floor(scrollProgressRef.current)} | Progress: {(scrollProgressRef.current % 1 * 100).toFixed(0)}%
        </div>
      </div>
    </div>
  )
}
