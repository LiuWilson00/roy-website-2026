/**
 * Stage Interpolation
 * 處理 Stage 之間的平滑過渡
 */

import type { Particle, ParticleState, TransformContext, StageTransform, StageConfig, SceneState, CoreGlowState } from './types'
import { DEFAULT_CORE_STATE } from './types'
import { lerp, easeInOutCubic, clamp, lerpHSL, parseHSL } from '../utils/math'

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
  }
}

/**
 * 在兩個 Stage 之間進行過渡
 */
export function interpolateStages(
  particle: Particle,
  context: TransformContext,
  fromStage: StageTransform,
  toStage: StageTransform,
  progress: number
): ParticleState {
  const fromState = fromStage(particle, context)
  const toState = toStage(particle, context)
  return interpolateState(fromState, toState, progress)
}

/**
 * 根據滾動位置計算當前應該顯示的 Stage
 */
export function getCurrentStageInfo(
  scrollY: number,
  viewportHeight: number,
  stages: StageConfig[]
): {
  currentStage: StageConfig
  nextStage: StageConfig | null
  transitionProgress: number
} {
  // 計算滾動進度（以 vh 為單位）
  const scrollVh = (scrollY / viewportHeight) * 100

  // 找到當前所在的 stage
  let currentIndex = 0
  for (let i = 0; i < stages.length; i++) {
    if (scrollVh >= stages[i].scrollStart) {
      currentIndex = i
    }
  }

  const currentStage = stages[currentIndex]
  const nextStage = stages[currentIndex + 1] || null

  // 計算過渡進度
  let transitionProgress = 0
  if (nextStage) {
    const transitionStart = currentStage.scrollEnd
    const transitionEnd = nextStage.scrollStart

    if (scrollVh >= transitionStart && scrollVh <= transitionEnd) {
      transitionProgress = (scrollVh - transitionStart) / (transitionEnd - transitionStart)
    } else if (scrollVh > transitionEnd) {
      transitionProgress = 1
    }
  }

  return {
    currentStage,
    nextStage,
    transitionProgress,
  }
}

/**
 * 創建一個帶有過渡效果的複合變換函數
 */
export function createTransitionTransform(
  fromTransform: StageTransform,
  toTransform: StageTransform,
  progress: number
): StageTransform {
  return (particle: Particle, context: TransformContext): ParticleState => {
    return interpolateStages(particle, context, fromTransform, toTransform, progress)
  }
}

// ============ Scene State Interpolation ============

/**
 * 插值兩個顏色字串
 */
function lerpColorString(from: string, to: string, t: number): string {
  const fromHSL = parseHSL(from)
  const toHSL = parseHSL(to)

  if (!fromHSL || !toHSL) {
    return t < 0.5 ? from : to
  }

  return lerpHSL(fromHSL, toHSL, t)
}

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
    coreColor: lerpColorString(from.coreColor, to.coreColor, t),
    coreGlow: lerp(from.coreGlow, to.coreGlow, t),

    rayCount: Math.round(lerp(from.rayCount, to.rayCount, t)),
    rayLength: lerp(from.rayLength, to.rayLength, t),
    rayWidth: lerp(from.rayWidth, to.rayWidth, t),
    rayColor: lerpColorString(from.rayColor, to.rayColor, t),

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
