/**
 * Stage05Overlay - Stage 0.5 主覆蓋層
 * 顯示核心價值/優勢
 */

import { useRef, useMemo, useState, useCallback } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import { STAGE05_VISIBILITY, CARD_POSITIONS } from './types'
import { getCoreValuesData } from './data'
import HudCard from './HudCard'
import MobileHudCard from './MobileHudCard'
import { useLanguage } from '../../i18n'

interface Stage05OverlayProps {
  scrollProgress: number
  onNavigateNext?: () => void
}

export default function Stage05Overlay({ scrollProgress, onNavigateNext }: Stage05OverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const hasAnimatedRef = useRef(false)
  const { language, t } = useLanguage()

  // 根據語言取得資料
  const coreValues = useMemo(() => getCoreValuesData(language), [language])

  // 手機版輪播狀態
  const [currentIndex, setCurrentIndex] = useState(0)

  // 輪播導航
  const goToSlide = useCallback((index: number) => {
    const newIndex = Math.max(0, Math.min(index, coreValues.length - 1))
    setCurrentIndex(newIndex)
  }, [coreValues.length])

  const goToPrev = useCallback(() => {
    setCurrentIndex(prev => (prev === 0 ? coreValues.length - 1 : prev - 1))
  }, [coreValues.length])

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev === coreValues.length - 1 ? 0 : prev + 1))
  }, [coreValues.length])

  // 計算透明度
  const opacity = useMemo(() => {
    const { fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd } = STAGE05_VISIBILITY

    if (scrollProgress < fadeInStart) return 0
    if (scrollProgress < fadeInEnd) {
      return (scrollProgress - fadeInStart) / (fadeInEnd - fadeInStart)
    }
    if (scrollProgress < fadeOutStart) return 1
    if (scrollProgress < fadeOutEnd) {
      return 1 - (scrollProgress - fadeOutStart) / (fadeOutEnd - fadeOutStart)
    }
    return 0
  }, [scrollProgress])

  // 是否應該顯示
  const shouldRender = opacity > 0

  // 是否應該播放動畫（首次進入 Stage 0.5 時）
  const shouldAnimate = scrollProgress >= STAGE05_VISIBILITY.fadeInStart && !hasAnimatedRef.current

  // 標記已動畫
  if (shouldAnimate) {
    hasAnimatedRef.current = true
  }

  // 標題進場動畫
  useGSAP(() => {
    if (!shouldRender || !titleRef.current) return

    gsap.fromTo(
      titleRef.current,
      { y: -20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out',
        delay: 0.05,
      }
    )
  }, { scope: overlayRef, dependencies: [shouldRender] })

  if (!shouldRender) return null

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 z-20 pointer-events-none"
      style={{ opacity }}
    >
      {/* 標題 */}
      <div className="absolute top-[30px] md:top-8 left-0 right-0 text-left md:text-center pl-6 md:pl-0">
        <h2
          ref={titleRef}
          className="font-mono text-white text-xl md:text-2xl lg:text-3xl tracking-[0.2em] md:tracking-[0.3em] uppercase"
          style={{ opacity: 0 }}
        >
          Core Values
        </h2>
        {/* Hover 提示 - 僅桌面版 */}
        <p className="hidden md:block font-mono text-white/30 text-xs tracking-widest mt-2 animate-pulse">
          [ Hover for details ]
        </p>
      </div>

      {/* ===== 桌面版佈局 (md+) - 五角形環繞 ===== */}
      <div className="hidden md:flex absolute inset-0 items-center justify-center">
        {/*
          五角形佈局：卡片位置基於圓心，使用角度計算
          角度從頂部開始：-90°, -18°, 54°, 126°, 198° (每隔 72°)
          半徑：根據螢幕大小調整，確保不與粒子圓重疊
        */}

        {/* 頂部 - 12 點鐘方向 */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: 'calc(50% - 280px)' }}
        >
          <HudCard
            value={coreValues[0]}
            position={CARD_POSITIONS[0]}
            animate={shouldAnimate}
          />
        </div>

        {/* 右上 - 約 2 點鐘方向 */}
        <div
          className="absolute"
          style={{
            left: 'calc(50% + 240px)',
            top: 'calc(50% - 100px)',
            transform: 'translateX(-50%)'
          }}
        >
          <HudCard
            value={coreValues[1]}
            position={CARD_POSITIONS[1]}
            animate={shouldAnimate}
          />
        </div>

        {/* 右下 - 約 4 點鐘方向 */}
        <div
          className="absolute"
          style={{
            left: 'calc(50% + 180px)',
            top: 'calc(50% + 180px)',
            transform: 'translateX(-50%)'
          }}
        >
          <HudCard
            value={coreValues[2]}
            position={CARD_POSITIONS[2]}
            animate={shouldAnimate}
          />
        </div>

        {/* 左下 - 約 8 點鐘方向 */}
        <div
          className="absolute"
          style={{
            left: 'calc(50% - 180px)',
            top: 'calc(50% + 180px)',
            transform: 'translateX(-50%)'
          }}
        >
          <HudCard
            value={coreValues[3]}
            position={CARD_POSITIONS[3]}
            animate={shouldAnimate}
          />
        </div>

        {/* 左上 - 約 10 點鐘方向 */}
        <div
          className="absolute"
          style={{
            left: 'calc(50% - 240px)',
            top: 'calc(50% - 100px)',
            transform: 'translateX(-50%)'
          }}
        >
          <HudCard
            value={coreValues[4]}
            position={CARD_POSITIONS[4]}
            animate={shouldAnimate}
          />
        </div>
      </div>

      {/* ===== 手機版佈局 (< md) - 中央輪播圖 ===== */}
      <div className="md:hidden absolute inset-0 flex flex-col items-center justify-center">
        {/* 輪播圖容器 */}
        <div className="relative w-full max-w-[320px] px-4">
          {/* 左箭頭 */}
          <button
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center text-cyan-400/60 hover:text-cyan-400 active:text-cyan-300 transition-colors pointer-events-auto"
            aria-label="Previous"
          >
            <HiChevronLeft size={28} />
          </button>

          {/* 右箭頭 */}
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center text-cyan-400/60 hover:text-cyan-400 active:text-cyan-300 transition-colors pointer-events-auto"
            aria-label="Next"
          >
            <HiChevronRight size={28} />
          </button>

          {/* 輪播內容 - 使用 transform 切換 */}
          <div className="overflow-hidden mx-6">
            <div
              className="flex transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {coreValues.map((value, index) => (
                <div
                  key={value.id}
                  className="flex-shrink-0 w-full flex justify-center"
                >
                  <MobileHudCard value={value} index={index} />
                </div>
              ))}
            </div>
          </div>

          {/* 輪播指示器 - 可點擊 */}
          <div className="flex justify-center gap-3 mt-4 pointer-events-auto">
            {coreValues.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-cyan-400 scale-125'
                    : 'bg-cyan-400/30 hover:bg-cyan-400/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* 計數器 */}
          <p className="font-mono text-cyan-400/50 text-xs tracking-wider text-center mt-3">
            {currentIndex + 1} / {coreValues.length}
          </p>
        </div>
      </div>

      {/* 底部提示 */}
      <div className="absolute bottom-6 md:bottom-8 left-0 right-0 text-center">
        <button
          onClick={onNavigateNext}
          className="group flex flex-col items-center gap-2 mx-auto pointer-events-auto cursor-pointer hover:opacity-80 transition-opacity"
        >
          <p className="font-mono text-white/40 text-xs tracking-[0.3em] uppercase group-hover:text-white/60 transition-colors">
            {t.scrollToExplore}
          </p>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            className="animate-bounce"
          >
            <path
              d="M6 0L6 10M6 10L1 5M6 10L11 5"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-white/40 group-hover:text-white/60 transition-colors"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
