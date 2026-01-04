/**
 * useStageComputation - Stage 狀態計算 Hook
 * 處理粒子狀態和場景狀態的計算邏輯
 */

import { useCallback } from 'react'
import type { Particle, ParticleState, TransformContext, SceneState, StageDefinition } from '../particles/types'
import { interpolateState, interpolateSceneState } from '../particles/interpolation'
import {
  calculateHoverOffset,
  calculateMagneticRepulsion,
  calculateRippleWaveOffset,
  type RippleWaveState,
} from '../particles/interactions'
import { getBreathRadius } from '../particles/transforms'
import { easeInOutCubic, cycleFromWhite, parseHSL, lerpHSL, CYCLE_COLORS, CYCLE_COLORS_BLUE } from '../utils/math'

// Re-export for convenience
export type { StageDefinition }

// Stage 互動強度配置
export const STAGE_TRANSITION_CONFIG = {
  /** Stage 0 互動在此進度後開始減弱 */
  stage0FadeStart: 0,
  /** Stage 0 互動完全消失的進度 */
  stage0FadeEnd: 0.5,
  /** Stage 1 互動開始的進度 */
  stage1Start: 0.3,
  /** Stage 1 互動完全生效的進度 */
  stage1Full: 1.0,
  /** Stage 3 過渡開始的進度 */
  stage3TransitionStart: 2,
  /** 顏色循環週期（秒） */
  colorCycleDuration: 8,
}

interface UseStageComputationOptions {
  /** Stage 定義陣列 */
  stages: StageDefinition[]
  /** 粒子陣列 */
  particles: Particle[]
  /** 取得點擊偏移量的函數 */
  getClickOffset: (index: number) => number
}

interface ComputeParticleStateParams {
  particleIndex: number
  context: TransformContext
  scrollProgress: number
  rippleWave: RippleWaveState
}

interface UseStageComputationReturn {
  /** 計算單個粒子狀態 */
  computeParticleState: (params: ComputeParticleStateParams) => ParticleState
  /** 計算場景狀態 */
  computeSceneState: (context: TransformContext, scrollProgress: number) => SceneState
}

/**
 * Stage 狀態計算 Hook
 */
export function useStageComputation({
  stages,
  particles,
  getClickOffset,
}: UseStageComputationOptions): UseStageComputationReturn {

  /**
   * 根據滾動進度計算粒子狀態
   * 支援兩個 Stage 之間的平滑過渡
   */
  const computeParticleState = useCallback(({
    particleIndex,
    context,
    scrollProgress,
    rippleWave,
  }: ComputeParticleStateParams): ParticleState => {
    const particle = particles[particleIndex]
    const progress = scrollProgress

    // 計算當前在哪兩個 Stage 之間
    const stageIndex = Math.floor(progress)
    const stageProgress = progress - stageIndex

    const currentStage = stages[Math.min(stageIndex, stages.length - 1)]
    const nextStage = stages[Math.min(stageIndex + 1, stages.length - 1)]

    // 獲取兩個 Stage 的狀態
    const currentState = currentStage.transform(particle, context)
    const nextState = nextStage.transform(particle, context)

    // 插值過渡
    let baseState: ParticleState
    if (stageIndex >= stages.length - 1 || stageProgress === 0) {
      baseState = currentState
    } else {
      baseState = interpolateState(currentState, nextState, stageProgress)
    }

    // Stage 0 互動效果（接近 Stage 0 時應用，逐漸減弱）
    const { stage0FadeEnd, stage1Start, stage1Full, stage3TransitionStart, colorCycleDuration } = STAGE_TRANSITION_CONFIG
    const stage0Strength = Math.max(0, 1 - progress / stage0FadeEnd)

    if (stage0Strength > 0) {
      const breathRadius = getBreathRadius(context.time)
      const clickOffset = getClickOffset(particleIndex) * stage0Strength
      const hoverOffset = calculateHoverOffset(
        particle,
        context.time,
        context.mouse,
        context.center,
        breathRadius + clickOffset
      ) * stage0Strength

      const totalOffset = clickOffset + hoverOffset
      baseState = {
        ...baseState,
        x: baseState.x + Math.cos(particle.theta) * totalOffset,
        y: baseState.y + Math.sin(particle.theta) * totalOffset,
      }
    }

    // Stage 1 互動效果（進入 Stage 1 後啟用）
    const stage1Strength = Math.min(1, Math.max(0, progress - stage1Start) / (stage1Full - stage1Start))

    if (stage1Strength > 0) {
      // Effect A: 磁力排斥
      const repulsion = calculateMagneticRepulsion(
        { x: baseState.x, y: baseState.y },
        context.mouse
      )
      baseState.x += repulsion.dx * stage1Strength
      baseState.y += repulsion.dy * stage1Strength

      // Effect D: 點擊波紋
      const rippleOffset = calculateRippleWaveOffset(
        { x: baseState.x, y: baseState.y },
        rippleWave,
        context.time
      )
      baseState.x += rippleOffset.dx * stage1Strength
      baseState.y += rippleOffset.dy * stage1Strength

      // 波紋時粒子發光增強
      if (rippleOffset.intensity > 0) {
        baseState.glow = (baseState.glow || 5) * (1 + rippleOffset.intensity * 0.5)
      }
    }

    // Stage 3 使用純白色，不套用顏色循環
    // 計算 Stage 3 的強度
    const stage3Strength = Math.max(0, Math.min(1, progress - stage3TransitionStart))

    if (stage3Strength >= 1) {
      // Stage 3 完全進入：使用純白色
      baseState.color = 'white'
    } else {
      // Stage 0-2: 動態循環顏色（每個粒子有不同的相位偏移）
      // 使用 theta 作為偏移，讓相鄰粒子有相近但不同的顏色
      const colorOffset = particle.theta / (Math.PI * 2) // 0-1 基於角度位置

      // 使用 easing 讓顏色過渡更自然
      const colorProgress = easeInOutCubic(Math.min(progress, 1))

      // 計算最終顏色
      let cycleColor: string

      if (progress < 1) {
        // Stage 0→1: 純三色漸變
        cycleColor = cycleFromWhite(context.time, colorOffset, colorProgress, colorCycleDuration, CYCLE_COLORS)
      } else if (progress < 2) {
        // Stage 1→2: 從三色漸變平滑過渡到藍色系
        const blendProgress = easeInOutCubic(progress - 1) // 0 at progress=1, 1 at progress=2
        const colorFromThree = cycleFromWhite(context.time, colorOffset, colorProgress, colorCycleDuration, CYCLE_COLORS)
        const colorFromBlue = cycleFromWhite(context.time, colorOffset, colorProgress, colorCycleDuration, CYCLE_COLORS_BLUE)

        // 解析並混合兩種顏色
        const fromHSL = parseHSL(colorFromThree)
        const toHSL = parseHSL(colorFromBlue)

        if (fromHSL && toHSL) {
          cycleColor = lerpHSL(fromHSL, toHSL, blendProgress)
        } else {
          cycleColor = colorFromBlue
        }
      } else {
        // Stage 2+: 純藍色系
        cycleColor = cycleFromWhite(context.time, colorOffset, colorProgress, colorCycleDuration, CYCLE_COLORS_BLUE)
      }

      if (stage3Strength > 0) {
        // Stage 2→3 過渡中：從循環顏色漸變回白色
        // 使用 easing 讓過渡更平滑
        const fadeToWhite = easeInOutCubic(stage3Strength)
        // 透過降低飽和度和提高亮度來漸變回白色
        const fadedColorProgress = colorProgress * (1 - fadeToWhite)
        baseState.color = cycleFromWhite(context.time, colorOffset, fadedColorProgress, colorCycleDuration, CYCLE_COLORS_BLUE)
      } else {
        baseState.color = cycleColor
      }
    }

    return baseState
  }, [stages, particles, getClickOffset])

  /**
   * 計算場景狀態（中心光核等）
   */
  const computeSceneState = useCallback((
    context: TransformContext,
    scrollProgress: number
  ): SceneState => {
    const progress = scrollProgress

    // 計算當前在哪兩個 Stage 之間
    const stageIndex = Math.floor(progress)
    const stageProgress = progress - stageIndex

    const currentStage = stages[Math.min(stageIndex, stages.length - 1)]
    const nextStage = stages[Math.min(stageIndex + 1, stages.length - 1)]

    // 獲取兩個 Stage 的場景狀態
    const currentSceneState = currentStage.sceneState(context)
    const nextSceneState = nextStage.sceneState(context)

    // 插值過渡
    if (stageIndex >= stages.length - 1 || stageProgress === 0) {
      return currentSceneState
    }

    return interpolateSceneState(currentSceneState, nextSceneState, stageProgress)
  }, [stages])

  return {
    computeParticleState,
    computeSceneState,
  }
}

export default useStageComputation
