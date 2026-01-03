/**
 * Stage4Overlay - Contact 主覆蓋層
 * System Control / Contact 科幻介面
 */

import { useRef, useMemo } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { STAGE4_VISIBILITY, calculateStage4Opacity } from './types'
import { contactItems } from './data'
import ContactPanel from './ContactPanel'

interface Stage4OverlayProps {
  scrollProgress: number
}

export default function Stage4Overlay({ scrollProgress }: Stage4OverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const hasAnimatedRef = useRef(false)

  const opacity = useMemo(
    () => calculateStage4Opacity(scrollProgress),
    [scrollProgress]
  )

  // 是否應該顯示
  const shouldRender = opacity > 0

  // 是否應該播放動畫（首次進入 Stage 4 時）
  const shouldAnimate = scrollProgress >= STAGE4_VISIBILITY.fadeInStart && !hasAnimatedRef.current

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

  // 不可見時不渲染
  if (!shouldRender) return null

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 z-20 pointer-events-none"
      style={{ opacity }}
    >
      {/* 背景漸層 - 讓內容更清晰 */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 50%, transparent 80%)',
        }}
      />

      {/* 標題 - 手機版置左，桌面版置中 */}
      <div className="absolute top-[30px] md:top-8 left-0 right-0 text-left md:text-center pl-6 md:pl-0">
        <h2
          ref={titleRef}
          className="font-mono text-white text-xl md:text-2xl lg:text-3xl tracking-[0.2em] md:tracking-[0.3em] uppercase"
          style={{ opacity: 0 }}
        >
          System Control / Contact
        </h2>
      </div>

      {/* 聯絡卡片面板 - 垂直置中，手機版增加頂部空間 */}
      <div className="absolute inset-0 flex items-center justify-center pt-20 pb-12 md:pt-20 md:pb-20">
        <div className="pointer-events-auto w-full">
          <ContactPanel items={contactItems} animate={shouldAnimate} />
        </div>
      </div>

      {/* 底部提示 */}
      <div className="absolute bottom-6 md:bottom-8 left-0 right-0 text-center">
        <p className="font-mono text-white/40 text-xs tracking-[0.3em] uppercase">
          End of Journey
        </p>
      </div>
    </div>
  )
}
