/**
 * Particle System Hook
 * 管理粒子系統的核心邏輯
 */

import { useMemo, useRef } from 'react'
import gsap from 'gsap'
import type { Particle, ParticleSystemConfig, DEFAULT_CONFIG } from '../particles/types'

interface UseParticleSystemOptions extends Partial<ParticleSystemConfig> {}

/**
 * 生成粒子陣列
 */
function generateParticles(config: ParticleSystemConfig): Particle[] {
  const { count, baseRadius, layers = 1 } = config

  // 如果只有一層，簡單生成
  if (layers === 1) {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      theta: (i / count) * Math.PI * 2,
      baseRadius,
    }))
  }

  // 多層生成
  const particles: Particle[] = []
  const particlesPerLayer = Math.floor(count / layers)

  for (let layer = 0; layer < layers; layer++) {
    const layerRadius = baseRadius * (0.5 + (layer / layers) * 0.5)
    for (let i = 0; i < particlesPerLayer; i++) {
      particles.push({
        id: layer * particlesPerLayer + i,
        theta: (i / particlesPerLayer) * Math.PI * 2,
        baseRadius: layerRadius,
      })
    }
  }

  return particles
}

export function useParticleSystem(options: UseParticleSystemOptions = {}) {
  // 合併配置
  const config: ParticleSystemConfig = {
    count: options.count ?? 80,
    baseRadius: options.baseRadius ?? 180,
    layers: options.layers ?? 1,
  }

  // 生成粒子（只在配置改變時重新生成）
  const particles = useMemo(
    () => generateParticles(config),
    [config.count, config.baseRadius, config.layers]
  )

  // 點擊偏移量（用於漣漪效果）
  const clickOffsetsRef = useRef<number[]>([])

  // 初始化偏移量
  if (clickOffsetsRef.current.length !== particles.length) {
    clickOffsetsRef.current = particles.map(() => 0)
  }

  /**
   * 觸發點擊漣漪效果
   */
  const triggerRipple = (
    particleIndex: number,
    strength: number,
    duration: number = 0.8
  ) => {
    const offsetObj = { value: clickOffsetsRef.current[particleIndex] || 0 }

    gsap.killTweensOf(offsetObj)

    gsap.to(offsetObj, {
      value: strength,
      duration: 0.1,
      ease: 'power2.out',
      onUpdate: () => {
        clickOffsetsRef.current[particleIndex] = offsetObj.value
      },
      onComplete: () => {
        gsap.to(offsetObj, {
          value: 0,
          duration,
          ease: 'elastic.out(1, 0.3)',
          onUpdate: () => {
            clickOffsetsRef.current[particleIndex] = offsetObj.value
          },
        })
      },
    })
  }

  /**
   * 取得指定粒子的點擊偏移量
   */
  const getClickOffset = (index: number): number => {
    return clickOffsetsRef.current[index] || 0
  }

  return {
    particles,
    config,
    clickOffsetsRef,
    triggerRipple,
    getClickOffset,
  }
}

export default useParticleSystem
