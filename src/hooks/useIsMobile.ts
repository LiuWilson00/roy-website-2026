/**
 * useIsMobile - 手機裝置偵測 Hook
 * 統一的手機版判斷邏輯，供全站共用
 */

import { useState, useEffect } from 'react'

// 手機版斷點
const MOBILE_BREAKPOINT = 768

/**
 * 偵測是否為行動裝置
 * 檢查條件：
 * 1. 螢幕寬度 < 768px
 * 2. 觸控裝置 + 行動裝置 User Agent
 */
export function detectMobile(): boolean {
  if (typeof window === 'undefined') return false

  // 檢查螢幕寬度
  const isSmallScreen = window.innerWidth < MOBILE_BREAKPOINT

  // 檢查觸控裝置
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

  // 檢查 User Agent (作為備用)
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )

  return isSmallScreen || (isTouchDevice && isMobileUA)
}

/**
 * 手機版偵測 Hook
 * 自動監聽視窗大小變化並更新狀態
 */
export function useIsMobile(): boolean {
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

  return isMobile
}

export default useIsMobile
