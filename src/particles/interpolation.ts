/**
 * Stage Interpolation
 * 處理 Stage 之間的平滑過渡
 */

import type { Particle, ParticleState, TransformContext, StageTransform, StageConfig } from './types'
import { lerp, easeInOutCubic, clamp } from '../utils/math'

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
