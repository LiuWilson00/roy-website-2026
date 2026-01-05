/**
 * CoreValueCard - 核心價值卡片
 * 終端機風格的科幻卡片，hover 顯示詳細描述
 */

import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import type { CoreValue, CardPosition } from './types'
import { CARD_ENTRANCE_DELAYS } from './types'

interface CoreValueCardProps {
  value: CoreValue
  position: CardPosition
  animate?: boolean
}

export default function CoreValueCard({
  value,
  position,
  animate = true,
}: CoreValueCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const shimmerRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [hasBeenHovered, setHasBeenHovered] = useState(false)

  // 進場動畫
  useGSAP(() => {
    if (!animate || !cardRef.current) return

    const delay = CARD_ENTRANCE_DELAYS[position]

    gsap.fromTo(
      cardRef.current,
      {
        opacity: 0,
        scale: 0.85,
        y: 15,
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.5,
        ease: 'back.out(1.4)',
        delay,
      }
    )
  }, { scope: cardRef })

  // 閃爍提示動畫（未 hover 過時週期性閃爍）
  useGSAP(() => {
    if (!shimmerRef.current || hasBeenHovered) return

    const delay = CARD_ENTRANCE_DELAYS[position] + 1 // 進場動畫後開始

    gsap.to(shimmerRef.current, {
      opacity: 0.6,
      duration: 0.8,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      delay,
    })
  }, { scope: shimmerRef, dependencies: [hasBeenHovered] })

  // Hover 處理
  const handleMouseEnter = () => {
    setIsHovered(true)
    setHasBeenHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  return (
    <div
      ref={cardRef}
      className="relative group"
      style={{ opacity: animate ? 0 : 1 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 閃爍提示層（未 hover 過時顯示） */}
      {!hasBeenHovered && (
        <div
          ref={shimmerRef}
          className="absolute inset-0 rounded-sm pointer-events-none z-10"
          style={{
            opacity: 0,
            background: 'linear-gradient(135deg, transparent 40%, rgba(0, 255, 255, 0.15) 50%, transparent 60%)',
            backgroundSize: '200% 200%',
          }}
        />
      )}

      {/* 卡片容器 */}
      <div className="relative px-4 py-3 border border-cyan-400/40 bg-black/70 backdrop-blur-sm rounded-sm min-w-[120px] transition-all duration-300 group-hover:border-cyan-400/70 group-hover:bg-black/85 pointer-events-auto cursor-pointer">
        {/* 角落裝飾 - 左上 */}
        <div className="absolute -top-px -left-px w-2 h-2 border-t border-l border-cyan-400/70 transition-colors duration-300 group-hover:border-cyan-300" />
        {/* 角落裝飾 - 右上 */}
        <div className="absolute -top-px -right-px w-2 h-2 border-t border-r border-cyan-400/70 transition-colors duration-300 group-hover:border-cyan-300" />
        {/* 角落裝飾 - 左下 */}
        <div className="absolute -bottom-px -left-px w-2 h-2 border-b border-l border-cyan-400/70 transition-colors duration-300 group-hover:border-cyan-300" />
        {/* 角落裝飾 - 右下 */}
        <div className="absolute -bottom-px -right-px w-2 h-2 border-b border-r border-cyan-400/70 transition-colors duration-300 group-hover:border-cyan-300" />

        {/* Icon */}
        <div className="font-mono text-cyan-400 text-sm mb-1 opacity-80 transition-opacity duration-300 group-hover:opacity-100">
          {value.icon}
        </div>

        {/* Title */}
        <div className="font-mono text-white text-sm tracking-wide font-medium">
          {value.title}
        </div>

        {/* Subtitle */}
        <div className="font-mono text-white/50 text-xs tracking-wider mt-0.5 transition-colors duration-300 group-hover:text-white/70">
          {value.subtitle}
        </div>
      </div>

      {/* Hover 描述 Tooltip */}
      {value.description && (
        <div
          className={`absolute left-1/2 -translate-x-1/2 mt-2 w-64 px-4 py-3 bg-black/95 border border-cyan-400/50 rounded-sm backdrop-blur-md z-50 transition-all duration-300 pointer-events-none ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
          }`}
        >
          {/* Tooltip 箭頭 */}
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-black/95 border-t border-l border-cyan-400/50 rotate-45" />

          {/* 描述文字 */}
          <p className="font-mono text-white/80 text-xs leading-relaxed relative z-10">
            {value.description}
          </p>

          {/* 角落裝飾 */}
          <div className="absolute -top-px -left-px w-2 h-2 border-t border-l border-cyan-400/70" />
          <div className="absolute -top-px -right-px w-2 h-2 border-t border-r border-cyan-400/70" />
          <div className="absolute -bottom-px -left-px w-2 h-2 border-b border-l border-cyan-400/70" />
          <div className="absolute -bottom-px -right-px w-2 h-2 border-b border-r border-cyan-400/70" />
        </div>
      )}

      {/* 光暈效果 */}
      <div
        className="absolute inset-0 rounded-sm pointer-events-none transition-all duration-300"
        style={{
          boxShadow: isHovered
            ? '0 0 30px rgba(0, 255, 255, 0.3)'
            : '0 0 20px rgba(0, 255, 255, 0.15)',
        }}
      />
    </div>
  )
}
