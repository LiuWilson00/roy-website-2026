/**
 * Stage1Overlay - Stage 1 主覆蓋層
 * 顯示個人經歷時間軸和技能儀表板
 * 響應式設計：桌面左右佈局，手機使用 Tab 切換
 */

import { useRef, useMemo, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { STAGE1_VISIBILITY } from './types'
import { timelineData, skillData } from './data'
import Timeline from './Timeline'
import SkillDashboard from './SkillDashboard'

interface Stage1OverlayProps {
  scrollProgress: number
  onNavigateNext?: () => void
}

type MobileTab = 'timeline' | 'skills'

export default function Stage1Overlay({ scrollProgress, onNavigateNext }: Stage1OverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const hasAnimatedRef = useRef(false)
  const [mobileTab, setMobileTab] = useState<MobileTab>('timeline')

  // 計算透明度
  const opacity = useMemo(() => {
    const { fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd } = STAGE1_VISIBILITY

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

  // 是否應該播放動畫（首次進入 Stage 1 時）
  const shouldAnimate = scrollProgress >= STAGE1_VISIBILITY.fadeInStart && !hasAnimatedRef.current

  // 標記已動畫
  if (shouldAnimate) {
    hasAnimatedRef.current = true
  }

  // 標題進場動畫
  useGSAP(() => {
    if (!shouldRender || !titleRef.current) return

    gsap.fromTo(
      titleRef.current,
      { y: -30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
        delay: 0.1,
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
      {/* 標題 - 手機版置左，桌面版置中 */}
      <div className="absolute top-[30px] md:top-8 left-0 right-0 text-left md:text-center pl-6 md:pl-0">
        <h2
          ref={titleRef}
          className="font-mono text-white text-xl md:text-2xl lg:text-3xl tracking-[0.2em] md:tracking-[0.3em] uppercase"
          style={{ opacity: 0 }}
        >
          Evolution & Mastery
        </h2>
      </div>

      {/* ===== 桌面版佈局 (md+) ===== */}
      <div className="hidden md:flex absolute inset-0 items-center justify-center">
        <div className="flex items-center justify-between w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl px-8">
          {/* 左側 - Timeline */}
          <div className="w-[280px] lg:w-[320px] xl:w-[350px] pointer-events-auto">
            <Timeline
              entries={timelineData}
              visibleCount={3}
              animate={shouldAnimate}
            />
          </div>

          {/* 中間空白 - 給粒子動畫 */}
          <div className="flex-1 min-w-[280px] lg:min-w-[350px] xl:min-w-[400px]" />

          {/* 右側 - Skill Dashboard */}
          <div className="pointer-events-auto w-[280px] lg:w-[320px] xl:w-[350px]">
            <SkillDashboard
              categories={skillData}
              animate={shouldAnimate}
            />
          </div>
        </div>
      </div>

      {/* ===== 手機版佈局 (< md) ===== */}
      <div className="md:hidden absolute inset-0 flex flex-col justify-end">
        {/* 內容區域 - 自動高度 */}
        <div className="relative mx-4 mb-4">
          {/* 玻璃背景 */}
          <div
            className="absolute inset-0 bg-black/80 border border-white/10 rounded-lg"
            style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
          />

          {/* 內容容器 */}
          <div className="relative z-10 px-4 py-4">
            {/* Tab 切換按鈕 */}
            <div className="flex justify-center gap-3 mb-4 pointer-events-auto">
              <button
                onClick={() => setMobileTab('timeline')}
                className={`
                  px-5 py-2 font-mono text-sm tracking-wider uppercase
                  border-2 rounded-md transition-all duration-200
                  ${mobileTab === 'timeline'
                    ? 'border-cyan-400 text-cyan-400 bg-cyan-400/20 shadow-[0_0_15px_rgba(0,255,255,0.3)]'
                    : 'border-white/30 text-white/60 hover:border-white/50 hover:text-white/80'
                  }
                `}
              >
                Experience
              </button>
              <button
                onClick={() => setMobileTab('skills')}
                className={`
                  px-5 py-2 font-mono text-sm tracking-wider uppercase
                  border-2 rounded-md transition-all duration-200
                  ${mobileTab === 'skills'
                    ? 'border-cyan-400 text-cyan-400 bg-cyan-400/20 shadow-[0_0_15px_rgba(0,255,255,0.3)]'
                    : 'border-white/30 text-white/60 hover:border-white/50 hover:text-white/80'
                  }
                `}
              >
                Skills
              </button>
            </div>

            {/* 內容 */}
            <div className="pointer-events-auto">
              {mobileTab === 'timeline' ? (
                <Timeline
                  entries={timelineData}
                  visibleCount={3}
                  animate={shouldAnimate}
                />
              ) : (
                <SkillDashboard
                  categories={skillData}
                  animate={shouldAnimate}
                />
              )}
            </div>
          </div>
        </div>

        {/* 底部滑動提示 - 手機版可點擊 */}
        <div className="text-center pb-4">
          <button
            onClick={onNavigateNext}
            className="group flex flex-col items-center gap-2 mx-auto pointer-events-auto cursor-pointer hover:opacity-80 transition-opacity"
          >
            <p className="font-mono text-white/30 text-xs tracking-widest uppercase group-hover:text-white/50 transition-colors">
              Scroll to explore
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
                className="text-white/30 group-hover:text-white/50 transition-colors"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 底部提示 - 只在桌面顯示 */}
      <div className="hidden md:block absolute bottom-8 left-0 right-0 text-center">
        <button
          onClick={onNavigateNext}
          className="group flex flex-col items-center gap-2 mx-auto pointer-events-auto cursor-pointer hover:opacity-80 transition-opacity"
        >
          <p className="font-mono text-white/40 text-xs tracking-[0.3em] uppercase group-hover:text-white/60 transition-colors">
            Scroll to Explore
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
