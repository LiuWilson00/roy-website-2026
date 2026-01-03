/**
 * ParticleCanvas - 粒子系統主渲染組件
 * 支援滾動驅動的 Stage 切換與過渡效果
 */

import { useRef, useState, useEffect } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

import { useParticleSystem } from '../hooks/useParticleSystem'
import { useMousePosition } from '../hooks/useMousePosition'
import { useScrollProgress } from '../hooks/useScrollProgress'
import { useStageComputation, type StageDefinition } from '../hooks/useStageComputation'
import CoreGlow from './CoreGlow'
import SVGFilters from './SVGFilters'
import StageDebugger from './StageDebugger'
import {
  stage0Transform,
  getBreathRadius,
  stage0SceneState,
  stage1Transform,
  stage1SceneState,
  stage2Transform,
  stage2SceneState,
  stage3Transform,
  stage3SceneState,
} from '../particles/transforms'
import {
  calculateRippleStrength,
  calculateCoreInteraction,
  INTERACTION_CONFIG,
  type RippleWaveState,
} from '../particles/interactions'
import { cycleColors } from '../utils/math'
import type { TransformContext, Point, SceneState } from '../particles/types'

// Stage 配置
const STAGES: StageDefinition[] = [
  { id: 0, name: 'circle', transform: stage0Transform, sceneState: stage0SceneState },
  { id: 1, name: 'bloom', transform: stage1Transform, sceneState: stage1SceneState },
  { id: 2, name: 'planetary', transform: stage2Transform, sceneState: stage2SceneState },
  { id: 3, name: 'grid', transform: stage3Transform, sceneState: stage3SceneState },
]

export default function ParticleCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const dotsRef = useRef<(SVGCircleElement | null)[]>([])
  const rectsRef = useRef<(SVGRectElement | null)[]>([])
  const glowRef = useRef<SVGFEGaussianBlurElement>(null)
  const glowIntensityRef = useRef<SVGFEGaussianBlurElement>(null)
  const pulseValueRef = useRef(0)

  // 粒子系統
  const { particles, triggerRipple, getClickOffset, recordPosition, getTrailPoints } = useParticleSystem({
    count: 80,
    baseRadius: 180,
  })

  // 滾動進度
  const { scrollProgressRef } = useScrollProgress({
    stageCount: STAGES.length,
    containerRef: containerRef as React.RefObject<HTMLElement>,
  })

  // Stage 計算
  const { computeParticleState, computeSceneState } = useStageComputation({
    stages: STAGES,
    particles,
    getClickOffset,
  })

  // 拖尾與光暈 refs
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

      const state = computeParticleState({
        particleIndex: i,
        context,
        scrollProgress: scrollProgressRef.current,
        rippleWave: rippleWaveRef.current,
      })

      // 記錄位置（用於拖尾）
      recordPosition(i, state.x, state.y)

      // 更新圓形粒子
      dot.setAttribute('cx', String(state.x))
      dot.setAttribute('cy', String(state.y))
      dot.setAttribute('r', String(Math.max(0, state.r)))
      dot.setAttribute('opacity', String(state.opacity))
      dot.setAttribute('fill', state.color || 'white')

      // 更新方形粒子
      const rect = rectsRef.current[i]
      if (rect) {
        const rectSize = state.rectSize ?? 0
        const rectOpacity = state.rectOpacity ?? 0
        rect.setAttribute('x', String(state.x - rectSize / 2))
        rect.setAttribute('y', String(state.y - rectSize / 2))
        rect.setAttribute('width', String(rectSize))
        rect.setAttribute('height', String(rectSize))
        rect.setAttribute('opacity', String(rectOpacity))
        rect.setAttribute('fill', state.color || 'white')
      }

      // 更新光暈覆蓋層粒子位置和顏色
      const glowDot = glowDotsRef.current[i]
      if (glowDot) {
        const pulseSize = 6 + pulseValueRef.current * 4
        glowDot.setAttribute('cx', String(state.x))
        glowDot.setAttribute('cy', String(state.y))
        glowDot.setAttribute('r', String(pulseSize))
        const glowColor = cycleColors(context.time, particles[i].theta / (Math.PI * 2), 8)
        glowDot.setAttribute('fill', glowColor)
      }

      // 更新拖尾
      const trailLength = state.trailLength ?? 0
      const trailGroup = trailGroupsRef.current[i]

      if (trailGroup && trailLength > 0) {
        const trails = getTrailPoints(i, trailLength, state.opacity, state.r)
        const circles = trailGroup.children

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

        while (circles.length > trails.length) {
          trailGroup.removeChild(circles[circles.length - 1])
        }
      } else if (trailGroup) {
        while (trailGroup.firstChild) {
          trailGroup.removeChild(trailGroup.firstChild)
        }
      }
    })

    // 更新光暈強度（基於滾動進度）
    const progress = scrollProgressRef.current
    if (mainGroupRef.current) {
      let filterValue = 'url(#glow)'
      if (progress >= 2.5) {
        filterValue = 'none'
      } else if (progress >= 2) {
        filterValue = 'url(#glow)'
      } else if (progress > 0.3) {
        filterValue = 'url(#glow-intense)'
      }
      mainGroupRef.current.setAttribute('filter', filterValue)
    }

    // 更新光暈覆蓋層透明度
    if (glowOverlayRef.current) {
      const pulseIntensity = pulseValueRef.current
      const stage3Fade = progress >= 2 ? Math.max(0, 1 - (progress - 2)) : 1
      const glowOpacity = progress * 0.3 * (0.5 + pulseIntensity * 0.5) * stage3Fade
      glowOverlayRef.current.setAttribute('opacity', String(glowOpacity))
    }

    // 更新場景狀態
    const newSceneState = computeSceneState(context, scrollProgressRef.current)
    setSceneState(newSceneState)
    timeRef.current = time

    // 計算光核互動強度
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

    // Stage 1: 波紋擴散效果
    if (progress > 0.3) {
      rippleWaveRef.current = {
        x: clickPoint.x,
        y: clickPoint.y,
        startTime: gsap.ticker.time,
        active: true,
      }
    }
  }

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

      // 強化光暈脈動動畫
      if (glowIntensityRef.current) {
        gsap.to(glowIntensityRef.current, {
          attr: { stdDeviation: 15 },
          duration: 1.5,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        })
      }

      // 脈動值動畫
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
      style={{ height: '400vh' }}
    >
      {/* Sticky 容器 */}
      <div
        ref={stickyRef}
        className="sticky top-0 w-full h-screen overflow-hidden cursor-pointer"
        onClick={handleClick}
      >
        {center.x > 0 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <SVGFilters glowRef={glowRef} glowIntensityRef={glowIntensityRef} />

            {/* 光暈覆蓋層 */}
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

            {/* 中心光核 */}
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
              {/* 拖尾 */}
              {particles.map((particle, i) => (
                <g
                  key={`trail-${particle.id}`}
                  ref={(el) => { trailGroupsRef.current[i] = el }}
                />
              ))}

              {/* 圓形粒子 */}
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

              {/* 方形粒子 */}
              {particles.map((particle, i) => {
                const pos = getInitialPosition(i)
                return (
                  <rect
                    key={`rect-${particle.id}`}
                    ref={(el) => { rectsRef.current[i] = el }}
                    x={pos.x}
                    y={pos.y}
                    width={0}
                    height={0}
                    fill="white"
                    opacity={0}
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

        {/* Debug UI */}
        <StageDebugger scrollProgress={scrollProgressRef.current} />
      </div>
    </div>
  )
}
