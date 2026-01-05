/**
 * Stage 0.5 - Core Values 類型定義
 */

// 核心價值資料結構
export interface CoreValue {
  id: string
  icon: string           // Emoji 或 icon 名稱
  title: string          // 主標題
  subtitle: string       // 副標題
  description?: string   // 詳細描述（hover 顯示）
}

// 卡片位置
export type CardPosition = 'top-left' | 'top-right' | 'center-left' | 'center-right' | 'bottom'

// Stage 0.5 可見性配置
export const STAGE05_VISIBILITY = {
  fadeInStart: 0.3,
  fadeInEnd: 0.7,
  fadeOutStart: 1.2,
  fadeOutEnd: 1.5,
}

// 卡片進場動畫延遲（依位置）
export const CARD_ENTRANCE_DELAYS: Record<CardPosition, number> = {
  'top-left': 0.1,
  'top-right': 0.2,
  'center-left': 0.3,
  'center-right': 0.4,
  'bottom': 0.5,
}

// 卡片位置配置
export const CARD_POSITIONS: CardPosition[] = [
  'top-left',
  'top-right',
  'center-left',
  'center-right',
  'bottom',
]
