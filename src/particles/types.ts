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
  trailLength?: number  // 拖尾長度 [0, 1]，0 = 無拖尾
}

// 拖尾配置
export interface TrailConfig {
  maxLength: number      // 最大歷史點數
  opacityDecay: number   // 透明度衰減曲線 (0-1, 1=線性)
  sizeDecay: number      // 大小衰減曲線 (0-1, 1=線性)
  minOpacity: number     // 最小透明度
  minSize: number        // 最小大小比例
}

// 預設拖尾配置
export const DEFAULT_TRAIL_CONFIG: TrailConfig = {
  maxLength: 12,
  opacityDecay: 0.7,
  sizeDecay: 0.8,
  minOpacity: 0.1,
  minSize: 0.3,
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

// ============ Scene-Level State (場景級狀態) ============

/**
 * 中心光核狀態
 * 控制太陽般的中心光源效果
 */
export interface CoreGlowState {
  visible: boolean       // 是否顯示
  opacity: number        // 整體透明度 [0, 1]
  size: number           // 核心大小 (px)
  rotation: number       // 當前旋轉角度 (radians)
  rotationSpeed: number  // 旋轉速度 (radians/sec)

  // 核心設定
  coreRadius: number     // 內核半徑
  coreColor: string      // 內核顏色
  coreGlow: number       // 內核光暈強度

  // 光線設定
  rayCount: number       // 光線數量
  rayLength: number      // 光線長度
  rayWidth: number       // 光線寬度
  rayColor: string       // 光線顏色

  // 脈動設定
  pulseSpeed: number     // 脈動速度
  pulseAmplitude: number // 脈動幅度 [0, 1]
}

/**
 * 場景狀態
 * 包含所有場景級視覺元素的狀態
 */
export interface SceneState {
  core: CoreGlowState
  // 未來擴充：
  // background?: BackgroundState
  // vignette?: VignetteState
  // particles connection lines?: ConnectionState
}

/**
 * 場景變換函數類型
 * 根據上下文計算場景狀態
 */
export type SceneTransform = (context: TransformContext) => SceneState

// 預設核心光暈狀態
export const DEFAULT_CORE_STATE: CoreGlowState = {
  visible: false,
  opacity: 0,
  size: 100,
  rotation: 0,
  rotationSpeed: 0.2,

  coreRadius: 20,
  coreColor: 'hsl(45, 100%, 70%)',
  coreGlow: 15,

  rayCount: 12,
  rayLength: 60,
  rayWidth: 3,
  rayColor: 'hsl(45, 100%, 80%)',

  pulseSpeed: 0.5,
  pulseAmplitude: 0.2,
}
