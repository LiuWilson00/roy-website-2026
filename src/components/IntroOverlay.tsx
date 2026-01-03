/**
 * IntroOverlay - Stage 0 個人資訊覆蓋層
 * 顯示姓名、職稱、標語等個人資訊
 */

import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

interface IntroOverlayProps {
  /** 滾動進度 (0 = Stage 0, 1 = Stage 1, etc.) */
  scrollProgress: number
  /** 導航到下一個 Stage */
  onNavigateNext?: () => void
}

// Typewriter 配置
const TYPEWRITER_CONFIG = {
  text: 'ROY',
  typingSpeed: 150, // ms per character
  cursorBlinkSpeed: 530, // ms
}

/**
 * Typewriter Hook - 打字機效果
 */
function useTypewriter(text: string, speed: number) {
  const [displayText, setDisplayText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    let currentIndex = 0
    setDisplayText('')
    setIsComplete(false)

    const timer = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayText(text.slice(0, currentIndex + 1))
        currentIndex++
      } else {
        setIsComplete(true)
        clearInterval(timer)
      }
    }, speed)

    return () => clearInterval(timer)
  }, [text, speed])

  return { displayText, isComplete }
}

/**
 * 閃爍游標組件
 */
function BlinkingCursor({ show }: { show: boolean }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (!show) return
    const timer = setInterval(() => {
      setVisible(v => !v)
    }, TYPEWRITER_CONFIG.cursorBlinkSpeed)
    return () => clearInterval(timer)
  }, [show])

  return (
    <span className={`${visible && show ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
      |
    </span>
  )
}

/**
 * 星形裝飾組件
 */
function StarDecoration({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      {/* 四角星 */}
      <path
        d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z"
        fill="currentColor"
      />
    </svg>
  )
}

export default function IntroOverlay({ scrollProgress, onNavigateNext }: IntroOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const { displayText, isComplete } = useTypewriter(
    TYPEWRITER_CONFIG.text,
    TYPEWRITER_CONFIG.typingSpeed
  )

  // 計算淡出透明度 (Stage 0 → Stage 1 過渡時淡出)
  const opacity = Math.max(0, 1 - scrollProgress * 2)

  // GSAP 動畫 - 入場效果
  useGSAP(() => {
    if (!overlayRef.current) return

    const elements = overlayRef.current.querySelectorAll('.intro-animate')

    gsap.fromTo(elements,
      {
        opacity: 0,
        y: 20
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 0.5,
      }
    )
  }, { scope: overlayRef })

  if (opacity <= 0) return null

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 z-20 pointer-events-none"
      style={{ opacity }}
    >
      {/* Top Bar */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
        {/* Left: Typewriter Name */}
        <div className="font-mono text-white text-lg tracking-wider intro-animate">
          <span className="text-white/60">&gt; </span>
          <span>{displayText}</span>
          <span className="text-white/60">_</span>
          <BlinkingCursor show={isComplete} />
        </div>
        {/* Right: 留空給 GlobalNav */}
        <div className="w-10" />
      </div>

      {/* Center Content - 放在粒子圓圈內 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        {/* Main Title */}
        <h1 className="font-mono text-white text-4xl md:text-5xl font-bold tracking-[0.2em] mb-4 intro-animate">
          ROY<span className="text-white/80">.</span>DEV
        </h1>

        {/* Subtitle */}
        <p className="font-mono text-white/70 text-sm tracking-[0.3em] uppercase mb-2 intro-animate">
          Software Engineer
        </p>

        {/* Tagline */}
        <p className="font-mono text-white/50 text-xs tracking-[0.2em] intro-animate">
          BUILDING LOGIC FROM CHAOS.
        </p>
      </div>

      {/* Below Circle - Hover Hint */}
      <div className="absolute top-[62%] left-1/2 -translate-x-1/2 intro-animate">
        <p className="font-mono text-white/30 text-xs tracking-[0.2em] uppercase">
          Hover to Engage
        </p>
      </div>

      {/* Bottom Section */}
      <div className="absolute bottom-8 left-0 right-0">
        {/* Scroll Hint - Center */}
        <div className="text-center intro-animate">
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

        {/* Star Decoration - Bottom Right */}
        <StarDecoration className="absolute bottom-0 right-8 text-white/60 intro-animate" />
      </div>
    </div>
  )
}
