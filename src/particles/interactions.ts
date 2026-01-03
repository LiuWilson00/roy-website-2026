/**
 * Particle Interaction Calculations
 * 處理滑鼠懸停、點擊等互動效果
 */

import { distance, polarToCartesian } from '../utils/math'
import type { Particle, Point } from './types'

// 互動配置
export const INTERACTION_CONFIG = {
  // 點擊漣漪
  ripple: {
    radius: 150,      // 影響範圍
    strength: 30,     // 最大位移
    duration: 0.8,    // 彈回時間
  },
  // 滑鼠懸停
  hover: {
    radius: 200,        // 影響範圍
    maxAmplitude: 8,    // 最大振幅
    frequency: 3,       // 時間頻率
    waveCount: 3,       // 圓周波數（整數確保首尾相接）
  },
}

/**
 * 計算滑鼠懸停造成的徑向偏移
 * 使用正弦波創造「活著」的感覺
 */
export function calculateHoverOffset(
  particle: Particle,
  time: number,
  mouse: Point,
  center: Point,
  currentRadius: number
): number {
  const { hover } = INTERACTION_CONFIG

  // 計算粒子當前位置
  const pos = polarToCartesian(center.x, center.y, currentRadius, particle.theta)

  // 計算與滑鼠的距離
  const dist = distance(pos.x, pos.y, mouse.x, mouse.y)

  // 超出影響範圍則無效果
  if (dist > hover.radius) return 0

  // 距離越近，振幅越大
  const proximityFactor = 1 - dist / hover.radius
  const amplitude = proximityFactor * hover.maxAmplitude

  // 使用角度作為相位基礎，乘以整數波數確保首尾相接
  const phase = particle.theta * hover.waveCount
  const oscillation = Math.sin(time * hover.frequency + phase) * amplitude

  return oscillation
}

/**
 * 計算點擊漣漪效果的初始強度
 * 返回每個粒子應該受到的位移強度
 */
export function calculateRippleStrength(
  particle: Particle,
  clickPoint: Point,
  center: Point,
  currentRadius: number
): number {
  const { ripple } = INTERACTION_CONFIG

  // 計算粒子當前位置
  const pos = polarToCartesian(center.x, center.y, currentRadius, particle.theta)

  // 計算與點擊位置的距離
  const dist = distance(pos.x, pos.y, clickPoint.x, clickPoint.y)

  // 超出影響範圍則無效果
  if (dist >= ripple.radius) return 0

  // 距離越近，強度越大
  return (1 - dist / ripple.radius) * ripple.strength
}

/**
 * 計算粒子與某點的距離
 * 用於各種距離相關的互動計算
 */
export function getParticleDistance(
  particle: Particle,
  point: Point,
  center: Point,
  currentRadius: number
): number {
  const pos = polarToCartesian(center.x, center.y, currentRadius, particle.theta)
  return distance(pos.x, pos.y, point.x, point.y)
}
