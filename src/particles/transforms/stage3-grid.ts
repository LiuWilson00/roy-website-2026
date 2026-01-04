/**
 * Stage 3: Grid Wave (方陣波浪)
 * 粒子排列成 5×16 的方形網格（桌面版）或 5×8（手機版）
 * 單一波浪由上而下傳遞，被激發的方格會縮小
 */

import type { Particle, ParticleState, TransformContext, SceneState } from '../types'
import { DEFAULT_CORE_STATE } from '../types'
import { detectMobile } from '../../hooks/useIsMobile'

// 網格配置（桌面版）
export const GRID_CONFIG = {
  cols: 5,          // 列數
  rows: 16,         // 行數
  cellSize: 28,     // 單元格基礎大小
  gap: 10,          // 間距
}

// 網格配置（手機版 - 放大方塊、加大間距）
export const GRID_CONFIG_MOBILE = {
  cols: 5,          // 列數（維持）
  rows: 8,          // 行數（40 粒子 / 5 列）
  cellSize: 36,     // 單元格基礎大小（放大）
  gap: 16,          // 間距（加大 Y 軸視覺效果）
}

// 波浪配置
export const WAVE_CONFIG = {
  width: 3,             // 波浪寬度（影響幾行的範圍）
  shrinkAmount: 0.6,    // 收縮比例（1 = 完全收縮，0 = 不收縮）
  waveDuration: 3,      // 波浪掃過時間（秒）
  pauseDuration: 2.5,   // 波浪結束後暫停時間（秒）
}

// 波浪配置（手機版 - 較快的波浪）
export const WAVE_CONFIG_MOBILE = {
  width: 2,             // 波浪寬度（較窄，因為行數少）
  shrinkAmount: 0.6,    // 收縮比例
  waveDuration: 2,      // 波浪掃過時間（較快）
  pauseDuration: 2,     // 暫停時間
}

// 取得當前網格配置
function getGridConfig() {
  return detectMobile() ? GRID_CONFIG_MOBILE : GRID_CONFIG
}

// 取得當前波浪配置
function getWaveConfig() {
  return detectMobile() ? WAVE_CONFIG_MOBILE : WAVE_CONFIG
}

// Stage 3 配置
export const STAGE3_CONFIG = {
  glowBase: 0,          // 無光暈
  glowWave: 0,          // 波浪時也無光暈
}

/**
 * 根據粒子 ID 取得網格位置
 */
function getGridPosition(particleId: number): { row: number; col: number } {
  const gridConfig = getGridConfig()
  return {
    row: Math.floor(particleId / gridConfig.cols),
    col: particleId % gridConfig.cols,
  }
}

/**
 * 將網格座標轉換為螢幕座標
 */
function gridToScreen(row: number, col: number, center: { x: number; y: number }): { x: number; y: number } {
  const { cols, rows, cellSize, gap } = getGridConfig()

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
  const waveConfig = getWaveConfig()
  const gridConfig = getGridConfig()
  const { width, waveDuration, pauseDuration } = waveConfig
  const { rows } = gridConfig

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
  const gridConfig = getGridConfig()
  const waveConfig = getWaveConfig()

  // 計算網格位置
  const { row, col } = getGridPosition(particle.id)
  const screenPos = gridToScreen(row, col, center)

  // 計算由上而下的波浪效果
  const waveIntensity = calculateTopDownWaveEffect(row, time)

  // 基礎大小與波浪縮放（根據裝置動態計算）
  const baseSize = gridConfig.cellSize * 0.55
  const currentSize = baseSize * (1 - waveIntensity * waveConfig.shrinkAmount)

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
