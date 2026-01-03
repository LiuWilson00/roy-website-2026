/**
 * Stage Interpolation
 * 處理 Stage 之間的平滑過渡
 */

import type { ParticleState, SceneState, CoreGlowState } from './types'
import { lerp, easeInOutCubic, clamp, lerpHSL, parseHSL } from '../utils/math'

/**
 * 插值兩個顏色字串（支援 'white' 和 HSL 格式）
 */
function lerpColor(from: string | undefined, to: string | undefined, t: number): string | undefined {
  if (!from && !to) return undefined
  if (!from) return to
  if (!to) return from

  const fromHSL = parseHSL(from)
  const toHSL = parseHSL(to)

  if (!fromHSL || !toHSL) {
    // 無法解析時使用階梯式切換
    return t < 0.5 ? from : to
  }

  return lerpHSL(fromHSL, toHSL, t)
}

/**
 * 在兩個 ParticleState 之間進行插值
 */
export function interpolateState(
  from: ParticleState,
  to: ParticleState,
  progress: number
): ParticleState {
  // 使用 easing 讓過渡更自然
  const t = easeInOutCubic(clamp(progress, 0, 1))

  return {
    x: lerp(from.x, to.x, t),
    y: lerp(from.y, to.y, t),
    r: lerp(from.r, to.r, t),
    opacity: lerp(from.opacity, to.opacity, t),
    glow: lerp(from.glow, to.glow, t),
    trailLength: lerp(from.trailLength ?? 0, to.trailLength ?? 0, t),
    // 方形屬性插值（支援圓形↔方形平滑過渡）
    rectSize: lerp(from.rectSize ?? 0, to.rectSize ?? 0, t),
    rectOpacity: lerp(from.rectOpacity ?? 0, to.rectOpacity ?? 0, t),
    // 顏色插值（支援 white 與 HSL 之間平滑過渡）
    color: lerpColor(from.color, to.color, t),
  }
}

// ============ Scene State Interpolation ============

/**
 * 在兩個 CoreGlowState 之間進行插值
 */
export function interpolateCoreState(
  from: CoreGlowState,
  to: CoreGlowState,
  progress: number
): CoreGlowState {
  const t = easeInOutCubic(clamp(progress, 0, 1))

  return {
    visible: t > 0.01 ? (from.visible || to.visible) : from.visible,
    opacity: lerp(from.opacity, to.opacity, t),
    size: lerp(from.size, to.size, t),
    rotation: lerp(from.rotation, to.rotation, t),
    rotationSpeed: lerp(from.rotationSpeed, to.rotationSpeed, t),

    coreRadius: lerp(from.coreRadius, to.coreRadius, t),
    coreColor: lerpColor(from.coreColor, to.coreColor, t) || from.coreColor,
    coreGlow: lerp(from.coreGlow, to.coreGlow, t),

    rayCount: Math.round(lerp(from.rayCount, to.rayCount, t)),
    rayLength: lerp(from.rayLength, to.rayLength, t),
    rayWidth: lerp(from.rayWidth, to.rayWidth, t),
    rayColor: lerpColor(from.rayColor, to.rayColor, t) || from.rayColor,

    pulseSpeed: lerp(from.pulseSpeed, to.pulseSpeed, t),
    pulseAmplitude: lerp(from.pulseAmplitude, to.pulseAmplitude, t),
  }
}

/**
 * 在兩個 SceneState 之間進行插值
 */
export function interpolateSceneState(
  from: SceneState,
  to: SceneState,
  progress: number
): SceneState {
  return {
    core: interpolateCoreState(from.core, to.core, progress),
    // 未來擴充其他場景元素的插值
  }
}
