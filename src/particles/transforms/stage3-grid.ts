/**
 * Stage 3: Grid Wave (方陣波浪)
 * 粒子排列成 5×16 的方形網格
 * 單一波浪由上而下傳遞，被激發的方格會縮小
 */

import type { Particle, ParticleState, TransformContext, SceneState } from '../types'
import { DEFAULT_CORE_STATE } from '../types'

// 網格配置
export const GRID_CONFIG = {
  cols: 5,          // 列數
  rows: 16,         // 行數
  cellSize: 28,     // 單元格基礎大小（增大）
  gap: 10,          // 間距
}

// 波浪配置
export const WAVE_CONFIG = {
  width: 3,             // 波浪寬度（影響幾行的範圍）
  shrinkAmount: 0.6,    // 收縮比例（1 = 完全收縮，0 = 不收縮）
  waveDuration: 3,      // 波浪掃過時間（秒）
  pauseDuration: 2.5,   // 波浪結束後暫停時間（秒）
}

// Stage 3 配置
export const STAGE3_CONFIG = {
  baseSize: GRID_CONFIG.cellSize * 0.55,  // 方格基礎大小（增大）
  glowBase: 0,          // 無光暈
  glowWave: 0,          // 波浪時也無光暈
}

/**
 * 根據粒子 ID 取得網格位置
 */
function getGridPosition(particleId: number): { row: number; col: number } {
  return {
    row: Math.floor(particleId / GRID_CONFIG.cols),  // 0-15
    col: particleId % GRID_CONFIG.cols,              // 0-4
  }
}

/**
 * 將網格座標轉換為螢幕座標
 */
function gridToScreen(row: number, col: number, center: { x: number; y: number }): { x: number; y: number } {
  const { cols, rows, cellSize, gap } = GRID_CONFIG

  // 計算網格總尺寸
  const totalWidth = cols * cellSize + (cols - 1) * gap
  const totalHeight = rows * cellSize + (rows - 1) * gap

  // 計算該格子的中心位置
  const x = center.x - totalWidth / 2 + col * (cellSize + gap) + cellSize / 2
  const y = center.y - totalHeight / 2 + row * (cellSize + gap) + cellSize / 2

  return { x, y }
}

/**
 * 計算由上而下的單一波浪效果
 * @returns 0-1 的波浪強度
 */
function calculateTopDownWaveEffect(
  row: number,
  time: number
): number {
  const { width, waveDuration, pauseDuration } = WAVE_CONFIG
  const { rows } = GRID_CONFIG

  // 總週期 = 波浪時間 + 暫停時間
  const totalPeriod = waveDuration + pauseDuration
  const cycleTime = time % totalPeriod

  // 暫停期間無波浪
  if (cycleTime >= waveDuration) {
    return 0
  }

  // 波浪位置（0 = 最上方，rows = 最下方）
  const waveProgress = cycleTime / waveDuration
  const wavePosition = waveProgress * (rows + width * 2) - width  // 讓波浪從畫面外開始

  // 計算這一行與波浪中心的距離
  const distanceToWave = Math.abs(row - wavePosition)

  // 在波浪寬度範圍內才有效果
  if (distanceToWave < width) {
    // 使用 cosine 讓效果平滑，波峰在中心
    const intensity = Math.cos((distanceToWave / width) * Math.PI * 0.5)
    return intensity
  }

  return 0
}

/**
 * Stage 3 變換函數
 * 方形網格 + 由上而下的單一波浪
 */
export function stage3Transform(
  particle: Particle,
  context: TransformContext
): ParticleState {
  const { time, center } = context
  const config = STAGE3_CONFIG

  // 計算網格位置
  const { row, col } = getGridPosition(particle.id)
  const screenPos = gridToScreen(row, col, center)

  // 計算由上而下的波浪效果
  const waveIntensity = calculateTopDownWaveEffect(row, time)

  // 基礎大小與波浪縮放
  const baseSize = config.baseSize
  const currentSize = baseSize * (1 - waveIntensity * WAVE_CONFIG.shrinkAmount)

  // 波浪時稍微向上抬起
  const liftAmount = waveIntensity * -4

  return {
    x: screenPos.x,
    y: screenPos.y + liftAmount,
    // 圓形：Stage 3 不顯示圓形
    r: 0,
    opacity: 0,
    // 方形：主要顯示
    rectSize: currentSize,
    rectOpacity: 1,
    // 無光暈，純白色
    glow: 0,
    color: 'white',
    trailLength: 0,  // 無拖尾
  }
}

/**
 * Stage 3 場景狀態
 * 無中心光核
 */
export function stage3SceneState(_context: TransformContext): SceneState {
  return {
    core: {
      ...DEFAULT_CORE_STATE,
      visible: false,
      opacity: 0,
    }
  }
}

export default stage3Transform
