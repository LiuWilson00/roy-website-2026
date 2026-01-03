/**
 * Stage 4 - Contact 類型定義
 */

export type ContactType = 'email' | 'github' | 'linkedin' | 'resume' | 'twitter' | 'website'
export type ContactAction = 'link' | 'copy' | 'download'

export interface ContactItem {
  id: string
  type: ContactType
  title: string
  subtitle: string
  href: string
  action: ContactAction
}

// Contact 可見性配置 (顯示在 Stage 3)
export const STAGE4_VISIBILITY = {
  fadeInStart: 2.3,   // 開始淡入 (Stage 2 後段)
  fadeInEnd: 2.7,     // 完全可見 (Stage 3 前段)
  fadeOutStart: 4.0,  // 不淡出（最後一個 Stage）
  fadeOutEnd: 4.5,
}

// 顏色配置
export const CONTACT_COLORS = {
  primary: '#00c8ff',
  primaryDark: '#0099cc',
  primaryGlow: 'rgba(0, 200, 255, 0.4)',
  cardBg: 'rgba(0, 20, 40, 0.6)',
  cardBorder: 'rgba(0, 200, 255, 0.3)',
  cardBorderHover: 'rgba(0, 200, 255, 0.6)',
}

/**
 * 計算 Stage 4 透明度
 */
export function calculateStage4Opacity(scrollProgress: number): number {
  const { fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd } = STAGE4_VISIBILITY

  if (scrollProgress < fadeInStart) return 0
  if (scrollProgress < fadeInEnd) {
    return (scrollProgress - fadeInStart) / (fadeInEnd - fadeInStart)
  }
  if (scrollProgress < fadeOutStart) return 1
  if (scrollProgress < fadeOutEnd) {
    return 1 - (scrollProgress - fadeOutStart) / (fadeOutEnd - fadeOutStart)
  }
  return 0
}
