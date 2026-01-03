/**
 * Particle Interaction Calculations
 * 處理滑鼠懸停、點擊等互動效果
 */

import { distance, polarToCartesian } from '../utils/math'
import type { Particle, Point } from './types'

// 互動配置
export const INTERACTION_CONFIG = {
  // 點擊漣漪 (Stage 0)
  ripple: {
    radius: 150,      // 影響範圍
    strength: 30,     // 最大位移
    duration: 0.8,    // 彈回時間
  },
  // 滑鼠懸停 (Stage 0)
  hover: {
    radius: 200,        // 影響範圍
    maxAmplitude: 8,    // 最大振幅
    frequency: 3,       // 時間頻率
    waveCount: 3,       // 圓周波數（整數確保首尾相接）
  },
  // 磁力排斥 (Stage 1 - Effect A)
  magnetic: {
    radius: 180,        // 影響範圍
    strength: 60,       // 最大排斥距離
    falloff: 2,         // 衰減曲線 (2 = 平方衰減)
  },
  // 點擊波紋 (Stage 1 - Effect D)
  rippleWave: {
    speed: 300,         // 波紋擴散速度 (px/sec)
    duration: 1.2,      // 波紋持續時間
    width: 80,          // 波紋寬度
    strength: 25,       // 波紋強度
    maxRadius: 400,     // 最大擴散半徑
  },
  // 光核互動 (Stage 1 - Effect F)
  coreInteraction: {
    radius: 150,        // 互動範圍
    pulseBoost: 3,      // 脈動速度提升倍數
    rayLengthBoost: 1.5, // 光線長度提升倍數
    glowBoost: 1.8,     // 光暈強度提升倍數
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

// ============ Stage 1 Interactions ============

/**
 * 計算磁力排斥效果 (Effect A)
 * 粒子被滑鼠推開，產生流體般的變形
 * @returns { dx, dy } 位移向量
 */
export function calculateMagneticRepulsion(
  particlePos: Point,
  mouse: Point
): { dx: number; dy: number } {
  const { magnetic } = INTERACTION_CONFIG

  const dist = distance(particlePos.x, particlePos.y, mouse.x, mouse.y)

  // 超出影響範圍則無效果
  if (dist > magnetic.radius || dist < 1) {
    return { dx: 0, dy: 0 }
  }

  // 計算排斥方向（從滑鼠指向粒子）
  const dirX = (particlePos.x - mouse.x) / dist
  const dirY = (particlePos.y - mouse.y) / dist

  // 平方衰減：越近排斥越強
  const normalizedDist = dist / magnetic.radius
  const repulsionFactor = Math.pow(1 - normalizedDist, magnetic.falloff)
  const repulsionStrength = repulsionFactor * magnetic.strength

  return {
    dx: dirX * repulsionStrength,
    dy: dirY * repulsionStrength,
  }
}

/**
 * 波紋狀態
 */
export interface RippleWaveState {
  x: number           // 波紋中心 X
  y: number           // 波紋中心 Y
  startTime: number   // 開始時間
  active: boolean     // 是否活躍
}

/**
 * 計算點擊波紋效果 (Effect D)
 * 返回粒子應該受到的位移（沿徑向方向）
 */
export function calculateRippleWaveOffset(
  particlePos: Point,
  ripple: RippleWaveState,
  currentTime: number
): { dx: number; dy: number; intensity: number } {
  const { rippleWave } = INTERACTION_CONFIG

  if (!ripple.active) {
    return { dx: 0, dy: 0, intensity: 0 }
  }

  const elapsed = currentTime - ripple.startTime

  // 波紋結束
  if (elapsed > rippleWave.duration) {
    return { dx: 0, dy: 0, intensity: 0 }
  }

  // 計算當前波紋半徑
  const waveRadius = elapsed * rippleWave.speed
  if (waveRadius > rippleWave.maxRadius) {
    return { dx: 0, dy: 0, intensity: 0 }
  }

  // 計算粒子與波紋中心的距離
  const dist = distance(particlePos.x, particlePos.y, ripple.x, ripple.y)

  // 計算粒子是否在波紋範圍內
  const distToWave = Math.abs(dist - waveRadius)
  if (distToWave > rippleWave.width / 2) {
    return { dx: 0, dy: 0, intensity: 0 }
  }

  // 波紋強度（靠近波峰最強）
  const waveIntensity = 1 - (distToWave / (rippleWave.width / 2))
  // 隨時間衰減
  const timeDecay = 1 - (elapsed / rippleWave.duration)
  const intensity = waveIntensity * timeDecay

  // 計算位移方向（從波紋中心向外）
  const dirX = dist > 1 ? (particlePos.x - ripple.x) / dist : 0
  const dirY = dist > 1 ? (particlePos.y - ripple.y) / dist : 0

  // 使用正弦波創造波動效果
  const wavePhase = (dist / rippleWave.width) * Math.PI * 2
  const waveOffset = Math.sin(wavePhase - elapsed * 10) * intensity * rippleWave.strength

  return {
    dx: dirX * waveOffset,
    dy: dirY * waveOffset,
    intensity,
  }
}

/**
 * 計算光核互動強度 (Effect F)
 * 返回 0-1 的互動強度，用於調整光核參數
 */
export function calculateCoreInteraction(
  mouse: Point,
  center: Point
): number {
  const { coreInteraction } = INTERACTION_CONFIG

  const dist = distance(mouse.x, mouse.y, center.x, center.y)

  if (dist > coreInteraction.radius) {
    return 0
  }

  // 越靠近中心，互動越強
  return Math.pow(1 - dist / coreInteraction.radius, 1.5)
}
