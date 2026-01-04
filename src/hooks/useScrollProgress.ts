/**
 * useScrollProgress - 滾動進度管理 Hook
 * 處理 ScrollTrigger 設置和 Stage 吸附
 */

import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

// 註冊 ScrollTrigger
gsap.registerPlugin(ScrollTrigger)

interface UseScrollProgressOptions {
  /** 總 Stage 數量 */
  stageCount: number
  /** ScrollTrigger 容器 ref */
  containerRef: React.RefObject<HTMLElement>
}

interface UseScrollProgressReturn {
  /** 滾動進度 ref (0 = Stage 0, 1 = Stage 1, etc.) */
  scrollProgressRef: React.MutableRefObject<number>
}

/**
 * 管理滾動進度和 Stage 吸附
 */
export function useScrollProgress({
  stageCount,
  containerRef,
}: UseScrollProgressOptions): UseScrollProgressReturn {
  // 滾動進度 (0 = Stage 0, 1 = Stage 1, etc.)
  const scrollProgressRef = useRef(0)

  // 設置 ScrollTrigger
  useGSAP(() => {
    if (!containerRef.current) return

    // 計算每個 Stage 的吸附點
    const snapIncrement = 1 / (stageCount - 1)  // 0, 0.33, 0.67, 1

    ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.3,  // 更快響應滾動
      // 滾動吸附設置
      snap: {
        snapTo: snapIncrement,  // 每個 Stage 吸附一次
        duration: { min: 0.15, max: 0.4 },  // 更快的吸附動畫
        delay: 0.02,  // 幾乎立即開始吸附
        ease: 'power3.out',  // 更靈敏的動畫曲線
      },
      onUpdate: (self) => {
        // 將滾動進度映射到 Stage
        scrollProgressRef.current = self.progress * (stageCount - 1)
      },
    })

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, { scope: containerRef })

  return {
    scrollProgressRef,
  }
}

export default useScrollProgress
