/**
 * Stage05Overlay - Stage 0.5 主覆蓋層
 * 顯示核心價值/優勢
 */

import { useRef, useMemo } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
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
        <div className="relative w-full max-w-[300px]">
          {/* 水平滾動輪播 */}
          <div
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {coreValues.map((value, index) => (
              <div
                key={value.id}
                className="flex-shrink-0 w-full flex justify-center snap-center px-4"
              >
                <MobileHudCard value={value} index={index} />
              </div>
            ))}
          </div>

          {/* 輪播指示器 */}
          <div className="flex justify-center gap-2 mt-4">
            {coreValues.map((_, index) => (
              <div
                key={index}
                className="w-2 h-2 rounded-full bg-cyan-400/30 transition-all duration-300"
              />
            ))}
          </div>

          {/* 滑動提示 */}
          <p className="font-mono text-white/30 text-[10px] tracking-wider text-center mt-3">
            ← SWIPE →
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
