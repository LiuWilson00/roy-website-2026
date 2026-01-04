/**
 * usePerformanceSettings - 效能設定 Hook
 * 根據裝置類型自動調整效能參數
 */

import { useState, useEffect, useMemo } from 'react'

export interface PerformanceSettings {
  /** 粒子數量 */
  particleCount: number
  /** 每 N 幀更新一次 (1 = 每幀, 2 = 每兩幀) */
  updateEveryNFrames: number
  /** State 更新閾值 (滾動進度變化超過此值才更新) */
  stateUpdateThreshold: number
  /** 是否啟用拖尾效果 */
  enableTrails: boolean
  /** 是否啟用光暈覆蓋層 */
  enableGlowOverlay: boolean
  /** 是否為行動裝置 */
  isMobile: boolean
}

// 桌面版設定
const DESKTOP_SETTINGS: PerformanceSettings = {
  particleCount: 80,
  updateEveryNFrames: 1,
  stateUpdateThreshold: 0.001,
  enableTrails: true,
  enableGlowOverlay: true,
  isMobile: false,
}

// 手機版設定（效能優化）
const MOBILE_SETTINGS: PerformanceSettings = {
  particleCount: 40,        // 減半
  updateEveryNFrames: 2,    // 每兩幀更新一次
  stateUpdateThreshold: 0.01, // 更寬鬆的更新閾值
  enableTrails: false,      // 停用拖尾
  enableGlowOverlay: false, // 停用光暈覆蓋層
  isMobile: true,
}

/**
 * 偵測是否為行動裝置
 */
function detectMobile(): boolean {
  if (typeof window === 'undefined') return false

  // 檢查螢幕寬度
  const isSmallScreen = window.innerWidth < 768

  // 檢查觸控裝置
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

  // 檢查 User Agent (作為備用)
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )

  return isSmallScreen || (isTouchDevice && isMobileUA)
}

/**
 * 效能設定 Hook
 * 自動根據裝置類型選擇最佳效能設定
 */
export function usePerformanceSettings(): PerformanceSettings {
  const [isMobile, setIsMobile] = useState(() => detectMobile())

  useEffect(() => {
    // 初始偵測
    setIsMobile(detectMobile())

    // 監聽視窗大小變化
    const handleResize = () => {
      setIsMobile(detectMobile())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const settings = useMemo(() => {
    return isMobile ? MOBILE_SETTINGS : DESKTOP_SETTINGS
  }, [isMobile])

  return settings
}

export default usePerformanceSettings
