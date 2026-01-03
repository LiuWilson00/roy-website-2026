/**
 * ParticleCanvas - 粒子系統主渲染組件
 * 使用新的架構：極座標粒子 + Stage 變換函數
 */

import { useRef, useState, useEffect } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

import { useParticleSystem } from '../hooks/useParticleSystem'
import { useMousePosition } from '../hooks/useMousePosition'
import { stage0Transform, getBreathRadius } from '../particles/transforms'
import { calculateHoverOffset, calculateRippleStrength, INTERACTION_CONFIG } from '../particles/interactions'
import type { TransformContext, Point, ParticleState } from '../particles/types'

export default function ParticleCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const dotsRef = useRef<(SVGCircleElement | null)[]>([])
  const glowRef = useRef<SVGFEGaussianBlurElement>(null)

  // 粒子系統
  const { particles, triggerRipple, getClickOffset } = useParticleSystem({
    count: 80,
    baseRadius: 180,
  })

  // 滑鼠位置追蹤
  const mouseRef = useMousePosition(containerRef as React.RefObject<HTMLElement>)

  // 畫布中心
  const [center, setCenter] = useState<Point>({ x: 0, y: 0 })

  // 更新畫布中心
  useEffect(() => {
    const updateCenter = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setCenter({ x: rect.width / 2, y: rect.height / 2 })
      }
    }
    updateCenter()
    window.addEventListener('resize', updateCenter)
    return () => window.removeEventListener('resize', updateCenter)
  }, [])

  /**
   * 計算單個粒子的最終狀態
   * 疊加：Stage 變換 + 點擊偏移 + 滑鼠懸停偏移
   */
  const computeParticleState = (
    particleIndex: number,
    context: TransformContext
  ): ParticleState => {
    const particle = particles[particleIndex]

    // 1. 從 Stage 變換獲得基礎狀態
    const baseState = stage0Transform(particle, context)

    // 2. 計算當前呼吸半徑（用於互動計算）
    const breathRadius = getBreathRadius(context.time)

    // 3. 點擊偏移
    const clickOffset = getClickOffset(particleIndex)

    // 4. 滑鼠懸停偏移
    const hoverOffset = calculateHoverOffset(
      particle,
      context.time,
      context.mouse,
      context.center,
      breathRadius + clickOffset
    )

    // 5. 計算最終座標（疊加偏移到徑向方向）
    const totalOffset = clickOffset + hoverOffset
    const finalX = baseState.x + Math.cos(particle.theta) * totalOffset
    const finalY = baseState.y + Math.sin(particle.theta) * totalOffset

    return {
      ...baseState,
      x: finalX,
      y: finalY,
    }
  }

  /**
   * 更新所有粒子位置
   */
  const updateAllParticles = (time: number) => {
    if (center.x === 0) return

    const context: TransformContext = {
      time,
      mouse: mouseRef.current,
      center,
      scrollProgress: 0,
      stageProgress: 0,
    }

    dotsRef.current.forEach((dot, i) => {
      if (!dot) return

      const state = computeParticleState(i, context)
      dot.setAttribute('cx', String(state.x))
      dot.setAttribute('cy', String(state.y))
      dot.setAttribute('r', String(state.r))
      dot.setAttribute('opacity', String(state.opacity))
    })
  }

  /**
   * 點擊處理：產生漣漪擾動
   */
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (center.x === 0) return

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const clickPoint: Point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }

    // 計算當前呼吸半徑
    const breathRadius = getBreathRadius(gsap.ticker.time)

    // 對每個粒子檢查是否在漣漪範圍內
    particles.forEach((particle, i) => {
      const currentRadius = breathRadius + getClickOffset(i)
      const strength = calculateRippleStrength(particle, clickPoint, center, currentRadius)

      if (strength > 0) {
        triggerRipple(i, strength, INTERACTION_CONFIG.ripple.duration)
      }
    })
  }

  // 主動畫循環
  useGSAP(() => {
    if (center.x === 0) return

    const ctx = gsap.context(() => {
      // 主更新循環
      const tickHandler = () => {
        updateAllParticles(gsap.ticker.time)
      }
      gsap.ticker.add(tickHandler)

      // 光暈脈動
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
    }, containerRef)

    return () => ctx.revert()
  }, { scope: containerRef, dependencies: [center, particles] })

  // 初始位置（供 SSR / 首次渲染）
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
      className="relative w-full h-screen bg-black overflow-hidden cursor-pointer"
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
    </div>
  )
}
