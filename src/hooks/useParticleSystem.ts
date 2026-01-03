/**
 * Particle System Hook
 * 管理粒子系統的核心邏輯
 */

import { useMemo, useRef, useCallback } from 'react'
import gsap from 'gsap'
import type { Particle, ParticleSystemConfig, TrailConfig, DEFAULT_TRAIL_CONFIG, Point } from '../particles/types'

// 位置歷史記錄
interface PositionHistory {
  positions: Point[]      // 歷史位置陣列
  maxLength: number       // 最大記錄數
}

// 拖尾點資料
export interface TrailPoint {
  x: number
  y: number
  opacity: number
  size: number
}

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

  // 位置歷史（用於拖尾效果）
  const positionHistoryRef = useRef<PositionHistory[]>([])

  // 初始化偏移量和歷史
  if (clickOffsetsRef.current.length !== particles.length) {
    clickOffsetsRef.current = particles.map(() => 0)
  }

  if (positionHistoryRef.current.length !== particles.length) {
    positionHistoryRef.current = particles.map(() => ({
      positions: [],
      maxLength: 12,
    }))
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

  /**
   * 記錄粒子位置（每幀呼叫）
   */
  const recordPosition = useCallback((index: number, x: number, y: number) => {
    const history = positionHistoryRef.current[index]
    if (!history) return

    // 將新位置添加到開頭
    history.positions.unshift({ x, y })

    // 限制歷史長度
    if (history.positions.length > history.maxLength) {
      history.positions.pop()
    }
  }, [])

  /**
   * 取得拖尾點陣列
   * @param index 粒子索引
   * @param trailLength 拖尾長度 (0-1)
   * @param baseOpacity 基礎透明度
   * @param baseSize 基礎大小
   * @param config 拖尾配置
   */
  const getTrailPoints = useCallback((
    index: number,
    trailLength: number,
    baseOpacity: number,
    baseSize: number,
    trailConfig?: Partial<TrailConfig>
  ): TrailPoint[] => {
    const history = positionHistoryRef.current[index]
    if (!history || trailLength <= 0) return []

    const cfg = {
      maxLength: 12,
      opacityDecay: 0.7,
      sizeDecay: 0.8,
      minOpacity: 0.1,
      minSize: 0.3,
      ...trailConfig,
    }

    // 計算實際顯示的歷史點數
    const pointCount = Math.floor(trailLength * cfg.maxLength)
    const points: TrailPoint[] = []

    for (let i = 0; i < Math.min(pointCount, history.positions.length); i++) {
      const pos = history.positions[i]
      const t = i / cfg.maxLength // 0 = 最新, 1 = 最舊

      // 使用指數衰減計算透明度和大小
      const opacityFactor = Math.pow(1 - t, 1 / cfg.opacityDecay)
      const sizeFactor = Math.pow(1 - t, 1 / cfg.sizeDecay)

      points.push({
        x: pos.x,
        y: pos.y,
        opacity: Math.max(cfg.minOpacity, baseOpacity * opacityFactor * trailLength),
        size: Math.max(cfg.minSize * baseSize, baseSize * sizeFactor),
      })
    }

    return points
  }, [])

  /**
   * 清除所有位置歷史
   */
  const clearHistory = useCallback(() => {
    positionHistoryRef.current.forEach(h => {
      h.positions = []
    })
  }, [])

  return {
    particles,
    config,
    clickOffsetsRef,
    triggerRipple,
    getClickOffset,
    recordPosition,
    getTrailPoints,
    clearHistory,
  }
}

export default useParticleSystem
