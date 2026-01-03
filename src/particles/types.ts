/**
 * Particle System Type Definitions
 */

// 粒子基礎資料（不變的極座標）
export interface Particle {
  id: number
  theta: number      // 極座標角度 [0, 2π)
  baseRadius: number // 基礎半徑（用於分層效果）
}

// 粒子渲染狀態（每幀計算）
export interface ParticleState {
  x: number          // 螢幕 X 座標
  y: number          // 螢幕 Y 座標
  r: number          // 點的大小
  opacity: number    // 透明度 [0, 1]
  glow: number       // 光暈強度
  color?: string     // 顏色（可選，預設白色）
}

// 2D 座標
export interface Point {
  x: number
  y: number
}

// 變換上下文（每幀輸入）
export interface TransformContext {
  time: number           // 動畫時間（秒）
  mouse: Point           // 滑鼠位置
  center: Point          // 畫布中心
  scrollProgress: number // 整體滾動進度 [0, 1]
  stageProgress: number  // 當前 stage 內的進度 [0, 1]
}

// Stage 變換函數類型
export type StageTransform = (
  particle: Particle,
  context: TransformContext
) => ParticleState

// 互動偏移量（用於疊加效果）
export interface InteractionOffsets {
  click: number[]   // 點擊漣漪偏移
  hover: number[]   // 滑鼠懸停偏移
}

// Stage 配置
export interface StageConfig {
  id: number
  name: string
  transform: StageTransform
  scrollStart: number  // 開始滾動位置 (vh)
  scrollEnd: number    // 結束滾動位置 (vh)
}

// 粒子系統配置
export interface ParticleSystemConfig {
  count: number         // 粒子數量
  baseRadius: number    // 基礎圓半徑
  layers?: number       // 分層數量（用於多層效果）
}

// 預設配置
export const DEFAULT_CONFIG: ParticleSystemConfig = {
  count: 80,
  baseRadius: 180,
  layers: 1,
}
