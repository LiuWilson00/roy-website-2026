/**
 * Stage 0: The Circle (呼吸圓環)
 * 粒子排列成圓形，透過半徑變化產生呼吸效果
 */

import type { Particle, ParticleState, TransformContext, StageTransform, SceneState } from '../types'
import { DEFAULT_CORE_STATE } from '../types'
import { polarToCartesian } from '../../utils/math'

// Stage 0 配置
export const STAGE0_CONFIG = {
  baseRadius: 180,
  breathAmplitude: 0.12,   // 呼吸振幅 (12%)
  breathFrequency: 0.125,  // 呼吸頻率 (8秒一週期，與原本相同)
  glowBase: 4,
  glowAmplitude: 4,
  particleSize: 3,
  // 粒子大小脈動
  sizePulseAmplitude: 0,   // Stage 0 不脈動
  sizePulseSpeed: 0,
}

/**
 * Stage 0 變換函數
 * 將極座標粒子渲染為呼吸的圓環
 */
export const stage0Transform: StageTransform = (
  particle: Particle,
  context: TransformContext
): ParticleState => {
  const { theta } = particle
  const { time, center } = context
  const config = STAGE0_CONFIG

  // 呼吸效果：半徑隨時間週期變化
  const breathFactor = 1 + config.breathAmplitude * Math.sin(time * config.breathFrequency * Math.PI * 2)
  const breathRadius = config.baseRadius * breathFactor

  // 計算螢幕座標
  const pos = polarToCartesian(center.x, center.y, breathRadius, theta)

  // 光暈同步呼吸
  const glow = config.glowBase + config.glowAmplitude * Math.sin(time * config.breathFrequency * Math.PI * 2)

  return {
    x: pos.x,
    y: pos.y,
    r: config.particleSize,
    opacity: 1,
    glow,
    trailLength: 0, // Stage 0 無拖尾
  }
}

/**
 * 取得當前呼吸半徑（供互動計算使用）
 */
export function getBreathRadius(time: number): number {
  const config = STAGE0_CONFIG
  const breathFactor = 1 + config.breathAmplitude * Math.sin(time * config.breathFrequency * Math.PI * 2)
  return config.baseRadius * breathFactor
}

/**
 * Stage 0 場景狀態
 * Stage 0 沒有中心光核
 */
export function stage0SceneState(_context: TransformContext): SceneState {
  return {
    core: {
      ...DEFAULT_CORE_STATE,
      visible: false,
      opacity: 0,
    }
  }
}

export default stage0Transform
