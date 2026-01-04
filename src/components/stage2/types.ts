/**
 * Stage 2 - Project Galaxy 類型定義
 */

// 專案資料
export interface Project {
  id: string
  name: string
  description: string
  thumbnail: string      // 圖片 URL (使用 picsum.photos)
  tags: string[]         // 技術標籤
  link?: string          // 專案連結
  github?: string        // GitHub 連結
  glowColor: GlowColor   // 星球光暈顏色
}

// 光暈顏色選項
export type GlowColor = 'cyan' | 'purple' | 'blue' | 'pink' | 'green' | 'orange' | 'yellow'

// 星球尺寸
export type PlanetSize = 'sm' | 'md' | 'lg' | 'xl'

// 星球固定位置
export interface PlanetPosition {
  x: number              // 相對位置 (0-100%)
  y: number
  size: PlanetSize
}

// 分頁配置
export interface GalaxyConfig {
  planetsPerPage: number  // 每頁星球數量 (3)
  positions: PlanetPosition[]  // 固定的三個位置
}

// 光暈顏色映射
export const GLOW_COLORS: Record<GlowColor, { primary: string; glow: string }> = {
  cyan: { primary: 'rgb(0, 255, 255)', glow: 'rgba(0, 255, 255, 0.6)' },
  purple: { primary: 'rgb(168, 85, 247)', glow: 'rgba(168, 85, 247, 0.6)' },
  blue: { primary: 'rgb(59, 130, 246)', glow: 'rgba(59, 130, 246, 0.6)' },
  pink: { primary: 'rgb(236, 72, 153)', glow: 'rgba(236, 72, 153, 0.6)' },
  green: { primary: 'rgb(34, 197, 94)', glow: 'rgba(34, 197, 94, 0.6)' },
  orange: { primary: 'rgb(249, 115, 22)', glow: 'rgba(249, 115, 22, 0.6)' },
  yellow: { primary: 'rgb(250, 204, 21)', glow: 'rgba(250, 204, 21, 0.6)' },
}

// 星球尺寸映射 (px) - 桌面版
export const SIZE_MAP: Record<PlanetSize, number> = {
  sm: 50,
  md: 70,
  lg: 90,
  xl: 120,
}

// 星球尺寸映射 (px) - 手機版（縮小）
export const SIZE_MAP_MOBILE: Record<PlanetSize, number> = {
  sm: 45,
  md: 60,
  lg: 75,
  xl: 95,
}

// Stage 2 可見性配置
export const STAGE2_VISIBILITY = {
  fadeInStart: 1.5,
  fadeInEnd: 2.0,
  fadeOutStart: 2.5,
  fadeOutEnd: 3.0,
}

// 每頁星球數量
export const PLANETS_PER_PAGE = 3

// 固定的三個星球位置（桌面版）
export const PLANET_POSITIONS: PlanetPosition[] = [
  { x: 20, y: 45, size: 'lg' },   // 左側
  { x: 50, y: 35, size: 'xl' },   // 中間（最大）
  { x: 80, y: 50, size: 'md' },   // 右側
]

// 固定的三個星球位置（手機版 - 垂直堆疊佈局，X 軸微偏移）
export const PLANET_POSITIONS_MOBILE: PlanetPosition[] = [
  { x: 55, y: 22.5, size: 'lg' },  // 頂部（偏右）
  { x: 45, y: 47, size: 'lg' },    // 中間（偏左）
  { x: 55, y: 71.5, size: 'lg' },  // 底部（偏右）
]
