/**
 * Stage2Overlay - Stage 2 主覆蓋層
 * 顯示 Project Galaxy 專案展示
 */

import { useRef, useMemo } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { STAGE2_VISIBILITY } from './types'
import { getProjectData } from './data'
import ProjectGalaxy from './ProjectGalaxy'
import { useLanguage } from '../../i18n'

interface Stage2OverlayProps {
  scrollProgress: number
  onNavigateNext?: () => void
}

export default function Stage2Overlay({ scrollProgress, onNavigateNext }: Stage2OverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const hasAnimatedRef = useRef(false)
  const { language, t } = useLanguage()

  // 根據語言取得專案資料
  const projectData = useMemo(() => getProjectData(language), [language])

  // 計算透明度
  const opacity = useMemo(() => {
    const { fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd } = STAGE2_VISIBILITY

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

  // 是否應該播放動畫（首次進入 Stage 2 時）
  const shouldAnimate = scrollProgress >= STAGE2_VISIBILITY.fadeInStart && !hasAnimatedRef.current

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
          className="font-mono text-white text-xl md:text-2xl lg:text-3xl tracking-[0.2em] md:tracking-[0.3em] uppercase italic"
          style={{ opacity: 0 }}
        >
          Project Galaxy
        </h2>
      </div>

      {/* 專案星系 - 留出頂部標題和底部提示空間 */}
      <div className="absolute inset-0 pt-20 pb-16 md:pt-24 md:pb-20">
        <ProjectGalaxy
          projects={projectData}
          animate={shouldAnimate}
        />
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
