/**
 * ParticleCanvas - 粒子系統主渲染組件
 * 支援滾動驅動的 Stage 切換與過渡效果
 */

import { useRef, useState, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

import { useParticleSystem } from '../hooks/useParticleSystem'
import { useMousePosition } from '../hooks/useMousePosition'
import {
  stage0Transform,
  getBreathRadius,
  stage1Transform,
  getLayerColor,
} from '../particles/transforms'
import { interpolateState } from '../particles/interpolation'
import { calculateHoverOffset, calculateRippleStrength, INTERACTION_CONFIG } from '../particles/interactions'
import { lerpFromWhite, easeInOutCubic } from '../utils/math'
import type { TransformContext, Point, ParticleState, StageTransform } from '../particles/types'

// 註冊 ScrollTrigger
gsap.registerPlugin(ScrollTrigger)

// Stage 配置
const STAGES: { id: number; name: string; transform: StageTransform }[] = [
  { id: 0, name: 'circle', transform: stage0Transform },
  { id: 1, name: 'bloom', transform: stage1Transform },
]

export default function ParticleCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const dotsRef = useRef<(SVGCircleElement | null)[]>([])
  const glowRef = useRef<SVGFEGaussianBlurElement>(null)

  // 滾動進度 (0 = Stage 0, 1 = Stage 1, etc.)
  const scrollProgressRef = useRef(0)

  // 粒子系統
  const { particles, triggerRipple, getClickOffset } = useParticleSystem({
    count: 80,
    baseRadius: 180,
  })

  // 滑鼠位置追蹤
  const mouseRef = useMousePosition(stickyRef as React.RefObject<HTMLElement>)

  // 畫布中心
  const [center, setCenter] = useState<Point>({ x: 0, y: 0 })

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

    // 添加互動效果（僅在接近 Stage 0 時應用完整效果，逐漸減弱）
    const interactionStrength = Math.max(0, 1 - progress * 0.5)

    if (interactionStrength > 0) {
      const breathRadius = getBreathRadius(context.time)
      const clickOffset = getClickOffset(particleIndex) * interactionStrength
      const hoverOffset = calculateHoverOffset(
        particle,
        context.time,
        context.mouse,
        context.center,
        breathRadius + clickOffset
      ) * interactionStrength

      const totalOffset = clickOffset + hoverOffset
      baseState = {
        ...baseState,
        x: baseState.x + Math.cos(particle.theta) * totalOffset,
        y: baseState.y + Math.sin(particle.theta) * totalOffset,
      }
    }

    // 平滑插值顏色（從白色過渡到 Stage 1 的分層顏色）
    const layer = particleIndex < 20 ? 0 : particleIndex < 50 ? 1 : 2
    const targetColor = getLayerColor(layer)

    // 使用 easing 讓顏色過渡更自然
    const colorProgress = easeInOutCubic(Math.min(progress, 1))
    baseState.color = lerpFromWhite(targetColor, colorProgress)

    return baseState
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
      dot.setAttribute('cx', String(state.x))
      dot.setAttribute('cy', String(state.y))
      dot.setAttribute('r', String(state.r))
      dot.setAttribute('opacity', String(state.opacity))

      // 設置顏色（已在 computeParticleState 中平滑插值）
      dot.setAttribute('fill', state.color || 'white')
    })
  }

  /**
   * 點擊處理
   */
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (center.x === 0) return
    // 只在 Stage 0 附近響應點擊
    if (scrollProgressRef.current > 0.5) return

    const rect = stickyRef.current?.getBoundingClientRect()
    if (!rect) return

    const clickPoint: Point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }

    const breathRadius = getBreathRadius(gsap.ticker.time)

    particles.forEach((particle, i) => {
      const currentRadius = breathRadius + getClickOffset(i)
      const strength = calculateRippleStrength(particle, clickPoint, center, currentRadius)

      if (strength > 0) {
        triggerRipple(i, strength, INTERACTION_CONFIG.ripple.duration)
      }
    })
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

      if (glowRef.current) {
        gsap.to(glowRef.current, {
          attr: { stdDeviation: 8 },
          duration: 4,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        })
      }

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
            </defs>

            <g filter="url(#glow)">
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
