/**
 * Stage 1: The Bloom (綻放/解析)
 * 粒子分裂成三層同心圓，各層反向旋轉
 * 引入青色 (Cyan) 與洋紅 (Magenta) 色彩
 */

import type { Particle, ParticleState, TransformContext, StageTransform, SceneState, CoreGlowState } from '../types'
import { DEFAULT_CORE_STATE } from '../types'
import { polarToCartesian } from '../../utils/math'

// Stage 1 配置
export const STAGE1_CONFIG = {
  // 三層半徑
  layers: [
    { radius: 100, rotationSpeed: 0.15, direction: 1 },   // 內層：順時針
    { radius: 160, rotationSpeed: 0.1, direction: -1 },   // 中層：逆時針
    { radius: 220, rotationSpeed: 0.08, direction: 1 },   // 外層：順時針
  ],
  // 呼吸效果（較輕微）
  breathAmplitude: 0.05,
  breathFrequency: 0.125,
  // 粒子大小
  particleSize: 3,
  // 光暈
  glowBase: 5,
  glowAmplitude: 3,
  // 粒子大小脈動 (Effect A)
  sizePulseAmplitude: 0.4,  // 40% 大小變化
  sizePulseSpeed: 2,        // 2秒週期
}

// 中心光核配置 (Effect F)
export const STAGE1_CORE_CONFIG: Partial<CoreGlowState> = {
  visible: true,
  opacity: 0.85,
  size: 80,
  rotationSpeed: 0.02,     // 非常慢速旋轉（約 50 秒一圈）

  coreRadius: 12,
  coreColor: 'hsl(280, 100%, 80%)',  // 紫色核心
  coreGlow: 10,

  rayCount: 24,            // 更多光線，更細緻
  rayLength: 50,
  rayWidth: 1.5,           // 更細的基礎寬度
  rayColor: 'hsl(200, 100%, 85%)',   // 青色光線

  pulseSpeed: 0.15,        // 更慢的脈動（約 6-7 秒週期）
  pulseAmplitude: 0.08,    // 更小的脈動幅度
}

// 色彩配置 (HSL 格式便於漸變)
export const STAGE1_COLORS = {
  inner: 'hsl(180, 100%, 70%)',   // Cyan 青色
  middle: 'hsl(300, 100%, 70%)',  // Magenta 洋紅
  outer: 'hsl(240, 100%, 80%)',   // 藍紫色
}

/**
 * 根據粒子 ID 決定所屬層級
 * 將 80 個粒子分成 3 層：內層 20, 中層 30, 外層 30
 */
function getParticleLayer(particleId: number, totalCount: number = 80): number {
  const innerCount = Math.floor(totalCount * 0.25)  // 25% 內層
  const middleCount = Math.floor(totalCount * 0.35) // 35% 中層
  // 剩餘 40% 外層

  if (particleId < innerCount) return 0        // 內層
  if (particleId < innerCount + middleCount) return 1  // 中層
  return 2  // 外層
}

/**
 * 根據層級獲取顏色
 */
export function getLayerColor(layer: number): string {
  switch (layer) {
    case 0: return STAGE1_COLORS.inner
    case 1: return STAGE1_COLORS.middle
    case 2: return STAGE1_COLORS.outer
    default: return 'white'
  }
}

/**
 * Stage 1 變換函數
 * 三層同心圓旋轉效果
 */
export const stage1Transform: StageTransform = (
  particle: Particle,
  context: TransformContext
): ParticleState => {
  const { theta, id } = particle
  const { time, center } = context
  const config = STAGE1_CONFIG

  // 決定粒子所屬層級
  const layer = getParticleLayer(id)
  const layerConfig = config.layers[layer]

  // 計算旋轉角度
  const rotation = time * layerConfig.rotationSpeed * layerConfig.direction * Math.PI * 2
  const rotatedTheta = theta + rotation

  // 輕微呼吸效果
  const breathFactor = 1 + config.breathAmplitude * Math.sin(time * config.breathFrequency * Math.PI * 2)
  const layerRadius = layerConfig.radius * breathFactor

  // 計算螢幕座標
  const pos = polarToCartesian(center.x, center.y, layerRadius, rotatedTheta)

  // 光暈效果
  const glow = config.glowBase + config.glowAmplitude * Math.sin(time * 0.5 + layer)

  // 粒子大小脈動 (Effect A)
  // 每個粒子有不同的相位偏移，產生波浪效果
  const sizePhase = theta + layer * 0.5 // 基於角度和層級的相位偏移
  const sizePulse = 1 + config.sizePulseAmplitude * Math.sin(time * config.sizePulseSpeed * Math.PI + sizePhase)
  const particleSize = config.particleSize * sizePulse

  return {
    x: pos.x,
    y: pos.y,
    r: particleSize,
    opacity: 1,
    glow,
    trailLength: 0.8, // Stage 1 有拖尾效果
  }
}

/**
 * 取得指定層級的當前半徑
 */
export function getLayerRadius(layer: number, time: number): number {
  const config = STAGE1_CONFIG
  const layerConfig = config.layers[layer]
  if (!layerConfig) return 180

  const breathFactor = 1 + config.breathAmplitude * Math.sin(time * config.breathFrequency * Math.PI * 2)
  return layerConfig.radius * breathFactor
}

/**
 * Stage 1 場景狀態
 * 包含中心光核效果
 */
export function stage1SceneState(context: TransformContext): SceneState {
  const { time } = context

  return {
    core: {
      ...DEFAULT_CORE_STATE,
      ...STAGE1_CORE_CONFIG,
      visible: true,
      rotation: time * (STAGE1_CORE_CONFIG.rotationSpeed ?? 0.1),
    }
  }
}

export default stage1Transform
