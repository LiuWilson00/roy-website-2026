/**
 * CentralSpine - 中央發光脊柱
 * 電路板風格的垂直點陣動畫
 */

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { CONTACT_COLORS } from './types'

interface CentralSpineProps {
  className?: string
}

const DOT_COUNT = 16
const DOT_SPACING = 24

export default function CentralSpine({ className = '' }: CentralSpineProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dotsRef = useRef<(HTMLDivElement | null)[]>([])

  // 脈動動畫
  useGSAP(() => {
    if (!containerRef.current) return

    // 從中間向兩端擴散的脈動效果
    const dots = dotsRef.current.filter(Boolean)

    gsap.to(dots, {
      keyframes: [
        { opacity: 0.3, scale: 0.6 },
        { opacity: 1, scale: 1.3 },
        { opacity: 0.3, scale: 0.6 },
      ],
      duration: 2.5,
      stagger: {
        each: 0.08,
        from: 'center',
      },
      repeat: -1,
      ease: 'sine.inOut',
    })
  }, [])

  const dots = Array.from({ length: DOT_COUNT }, (_, i) => i)

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col items-center justify-center ${className}`}
      style={{ width: '40px' }}
    >
      {/* 連接線 */}
      <div
        className="absolute inset-0 w-px left-1/2 -translate-x-1/2"
        style={{
          background: `linear-gradient(to bottom, transparent, ${CONTACT_COLORS.primary}40, ${CONTACT_COLORS.primary}40, transparent)`,
        }}
      />

      {/* 發光點陣 */}
      <div
        className="relative flex flex-col items-center"
        style={{ gap: `${DOT_SPACING - 8}px` }}
      >
        {dots.map((i) => (
          <div
            key={i}
            ref={(el) => { dotsRef.current[i] = el }}
            className="relative"
          >
            {/* 外層發光 */}
            <div
              className="absolute inset-0 rounded-full blur-sm"
              style={{
                backgroundColor: CONTACT_COLORS.primary,
                width: '8px',
                height: '8px',
                transform: 'translate(-50%, -50%)',
                left: '50%',
                top: '50%',
              }}
            />
            {/* 內層實心點 */}
            <div
              className="relative rounded-full"
              style={{
                backgroundColor: CONTACT_COLORS.primary,
                width: '6px',
                height: '6px',
                boxShadow: `0 0 10px ${CONTACT_COLORS.primaryGlow}, 0 0 20px ${CONTACT_COLORS.primaryGlow}`,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
