/**
 * Stage 0.5: Pulse Rings (脈衝波紋)
 * 粒子維持圓形排列，加入同心環狀脈衝波動，從圓心向外擴散
 * 視覺效果類似水波漣漪或雷達掃描
 */

import type { Particle, ParticleState, TransformContext, StageTransform, SceneState } from '../types'
import { DEFAULT_CORE_STATE } from '../types'
import { polarToCartesian, lerp } from '../../utils/math'

// Stage 0.5 配置
export const STAGE05_CONFIG = {
  // 基礎圓形配置（繼承 Stage 0 但減弱呼吸）
  baseRadius: 180,
  breathAmplitude: 0.06,      // 減弱呼吸幅度（Stage 0 是 0.12）
  breathFrequency: 0.125,     // 維持相同頻率

  // 脈衝波紋配置
  pulse: {
    count: 3,                 // 同時存在的波紋數量
    speed: 0.4,               // 波紋擴散速度
    amplitude: 35,            // 主軸振幅 (px) - 增大
    amplitudeY: 8,            // 副軸振幅（更小，橢圓更明顯）
    decay: 0.5,               // 衰減曲線
    phaseOffset: 2.094,       // 2π/3，波紋相位差
  },

  // 粒子樣式
  particle: {
    baseSize: 3,
    pulseSize: 5.5,           // 波紋經過時放大 - 增大
    baseOpacity: 0.85,
    pulseOpacity: 1,
  },

  // 光暈
  glowBase: 5,
  glowAmplitude: 4,

  // 顏色配置
  colors: {
    base: 'white',
    pulse: 'hsl(180, 80%, 75%)',  // 青色脈衝
  },
}

/**
 * 計算徑向脈衝效果（從中心向外擴散，橢圓形）
 *
 * 原理：
 * - 波紋從中心 (r=0) 向外擴散到最大半徑
 * - 當波紋半徑接近粒子半徑時，粒子受到影響
 * - X 軸方向振幅較大，Y 軸方向振幅較小，產生橢圓脈衝效果
 */
function calculatePulseEffect(
  particle: Particle,
  time: number,
  config: typeof STAGE05_CONFIG.pulse,
  baseRadius: number
): { radiusOffset: number; sizeMultiplier: number; opacityMultiplier: number } {
  // 粒子所在的正規化半徑位置（相對於最大波紋範圍）
  const maxWaveRadius = baseRadius * 1.3  // 波紋最大範圍
  const particleNormalizedRadius = baseRadius / maxWaveRadius

  let totalEffect = 0

  // 計算每個波紋的影響
  for (let i = 0; i < config.count; i++) {
    // 每個波紋有不同的時間偏移（錯開發射）
    const waveTimeOffset = i / config.count

    // 波紋當前的正規化半徑 [0, 1]
    // 從中心向外擴散
    const waveNormalizedRadius = ((time * config.speed) + waveTimeOffset) % 1

    // 計算波紋半徑與粒子半徑的距離
    const distance = Math.abs(waveNormalizedRadius - particleNormalizedRadius)

    // 高斯衰減 - 波紋的「厚度」
    const waveThickness = 0.12
    const gaussianEffect = Math.exp(-distance * distance / (waveThickness * waveThickness))

    // 波紋強度隨擴散而衰減（越外圍越弱）
    const distanceDecay = Math.pow(1 - waveNormalizedRadius, config.decay)

    totalEffect += gaussianEffect * distanceDecay
  }

  // 正規化效果值到 [0, 1]
  totalEffect = Math.min(1, totalEffect)

  // 使用正弦波平滑地在 X 軸和 Y 軸主導之間過渡
  // 週期與脈衝速度同步，確保過渡發生在波紋重置時
  // sin 值從 -1 到 1，映射到 0 到 1 作為混合權重
  const orientationPhase = (Math.sin(time * config.speed * Math.PI) + 1) / 2  // 0 到 1 平滑過渡

  // cos²(theta): 1 at X-axis (0, π), 0 at Y-axis (π/2, 3π/2)
  // sin²(theta): 0 at X-axis, 1 at Y-axis
  const xAxisInfluence = Math.pow(Math.cos(particle.theta), 2)
  const yAxisInfluence = Math.pow(Math.sin(particle.theta), 2)

  // 平滑混合 X 軸和 Y 軸的影響
  // orientationPhase = 0 時 X 軸主導，orientationPhase = 1 時 Y 軸主導
  const blendedInfluence = lerp(xAxisInfluence, yAxisInfluence, orientationPhase)
  const effectiveAmplitude = lerp(config.amplitudeY, config.amplitude, blendedInfluence)

  return {
    radiusOffset: totalEffect * effectiveAmplitude,
    sizeMultiplier: lerp(1, STAGE05_CONFIG.particle.pulseSize / STAGE05_CONFIG.particle.baseSize, totalEffect),
    opacityMultiplier: lerp(STAGE05_CONFIG.particle.baseOpacity, STAGE05_CONFIG.particle.pulseOpacity, totalEffect),
  }
}

/**
 * Stage 0.5 變換函數
 * 圓形 + 脈衝波紋效果
 */
export const stage05Transform: StageTransform = (
  particle: Particle,
  context: TransformContext
): ParticleState => {
  const { theta } = particle
  const { time, center } = context
  const config = STAGE05_CONFIG

  // 基礎呼吸效果（較弱）
  const breathFactor = 1 + config.breathAmplitude * Math.sin(time * config.breathFrequency * Math.PI * 2)
  const baseRadius = config.baseRadius * breathFactor

  // 計算脈衝效果（徑向擴散）
  const pulseEffect = calculatePulseEffect(particle, time, config.pulse, baseRadius)

  // 最終半徑 = 基礎半徑 + 脈衝偏移
  const finalRadius = baseRadius + pulseEffect.radiusOffset

  // 計算螢幕座標
  const pos = polarToCartesian(center.x, center.y, finalRadius, theta)

  // 光暈同步呼吸 + 脈衝增強
  const glow = config.glowBase + config.glowAmplitude * Math.sin(time * config.breathFrequency * Math.PI * 2)
  const enhancedGlow = glow + pulseEffect.radiusOffset * 0.3

  // 粒子大小
  const size = config.particle.baseSize * pulseEffect.sizeMultiplier

  return {
    x: pos.x,
    y: pos.y,
    r: size,
    opacity: pulseEffect.opacityMultiplier,
    glow: enhancedGlow,
    trailLength: 0, // Stage 0.5 無拖尾
  }
}

/**
 * 取得當前基礎半徑（供互動計算使用）
 */
export function getPulseBaseRadius(time: number): number {
  const config = STAGE05_CONFIG
  const breathFactor = 1 + config.breathAmplitude * Math.sin(time * config.breathFrequency * Math.PI * 2)
  return config.baseRadius * breathFactor
}

/**
 * Stage 0.5 場景狀態
 * 閃爍的中心恆星效果
 */
export function stage05SceneState(context: TransformContext): SceneState {
  const { time } = context

  // 多頻率疊加產生閃爍效果
  // 基礎脈動 + 快速閃爍 + 隨機感的高頻振動
  const basePulse = Math.sin(time * 0.8 * Math.PI * 2) * 0.15
  const fastFlicker = Math.sin(time * 3.5 * Math.PI * 2) * 0.1
  const highFreq = Math.sin(time * 7 * Math.PI * 2) * 0.05

  // 組合閃爍效果，基礎透明度 0.5
  const flickerOpacity = 0.5 + basePulse + fastFlicker + highFreq

  // 光線長度也隨閃爍變化
  const flickerRayLength = 35 + Math.sin(time * 2.5 * Math.PI * 2) * 8

  return {
    core: {
      ...DEFAULT_CORE_STATE,
      visible: true,
      opacity: Math.max(0.2, Math.min(0.85, flickerOpacity)),  // 限制在 0.2-0.85 之間
      size: 70,
      rotationSpeed: 0.08,

      coreRadius: 10,
      coreColor: 'hsl(180, 85%, 65%)',  // 青色
      coreGlow: 12,

      rayCount: 12,
      rayLength: flickerRayLength,
      rayWidth: 1.5,
      rayColor: 'hsl(185, 90%, 75%)',

      pulseSpeed: 0.6,        // 較快的脈動
      pulseAmplitude: 0.25,   // 較大的振幅
    }
  }
}

export default stage05Transform
