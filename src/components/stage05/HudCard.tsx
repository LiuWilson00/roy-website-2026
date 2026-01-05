/**
 * HudCard - HUD 風格科幻卡片
 * 帶有流動光線邊框動畫效果
 */

import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { HiOutlineInformationCircle } from 'react-icons/hi'
import type { CoreValue, CardPosition } from './types'
import { CARD_ENTRANCE_DELAYS } from './types'

interface HudCardProps {
  value: CoreValue
  position: CardPosition
  animate?: boolean
}

export default function HudCard({
  value,
  position,
  animate = true,
}: HudCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  // 卡片尺寸
  const width = 180
  const height = 110
  const cut = 14 // 切角大小

  // Tooltip 尺寸
  const tooltipWidth = 300
  const tooltipHeight = 130

  // SVG 路徑 - 六邊形切角造型
  const framePath = `
    M ${cut} 0
    H ${width - cut}
    L ${width} ${cut}
    V ${height - cut}
    L ${width - cut} ${height}
    H ${cut}
    L 0 ${height - cut}
    V ${cut}
    Z
  `

  // 進場動畫
  useGSAP(() => {
    if (!animate || !cardRef.current) return

    const delay = CARD_ENTRANCE_DELAYS[position]

    gsap.fromTo(
      cardRef.current,
      {
        opacity: 0,
        scale: 0.9,
        y: 20,
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
        delay,
      }
    )
  }, { scope: cardRef })

  return (
    <div
      ref={cardRef}
      className="relative group"
      style={{ opacity: animate ? 0 : 1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* SVG 框架 */}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="absolute inset-0 pointer-events-none"
      >
        <defs>
          {/* 發光濾鏡 */}
          <filter id={`glow-${value.id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 背景填充 */}
        <path
          d={framePath}
          fill="rgba(10, 10, 15, 0.85)"
          className="transition-all duration-300"
          style={{
            fill: isHovered ? 'rgba(10, 20, 30, 0.95)' : 'rgba(10, 10, 15, 0.85)',
          }}
        />

        {/* 基礎邊框 */}
        <path
          d={framePath}
          fill="none"
          stroke="rgba(0, 218, 250, 0.3)"
          strokeWidth="1"
          className="transition-all duration-300"
          style={{
            stroke: isHovered ? 'rgba(0, 218, 250, 0.6)' : 'rgba(0, 218, 250, 0.3)',
          }}
        />

        {/* 流動光線 */}
        <path
          d={framePath}
          fill="none"
          stroke="#00dafa"
          strokeWidth="2"
          strokeLinecap="round"
          filter={`url(#glow-${value.id})`}
          className="ray-path"
          style={{
            strokeDasharray: '60 400',
            strokeDashoffset: 0,
            opacity: isHovered ? 0.9 : 0.5,
          }}
        />

        {/* 角落高光 - 左上 */}
        <path
          d={`M 0 ${cut + 10} V ${cut} L ${cut} 0 H ${cut + 10}`}
          fill="none"
          stroke="#00dafa"
          strokeWidth="2"
          className="transition-all duration-300"
          style={{
            opacity: isHovered ? 1 : 0.6,
            filter: isHovered ? 'drop-shadow(0 0 4px #00dafa)' : 'none',
          }}
        />

        {/* 角落高光 - 右下 */}
        <path
          d={`M ${width} ${height - cut - 10} V ${height - cut} L ${width - cut} ${height} H ${width - cut - 10}`}
          fill="none"
          stroke="#00dafa"
          strokeWidth="2"
          className="transition-all duration-300"
          style={{
            opacity: isHovered ? 1 : 0.6,
            filter: isHovered ? 'drop-shadow(0 0 4px #00dafa)' : 'none',
          }}
        />
      </svg>

      {/* 卡片內容 */}
      <div
        className="relative px-4 py-3 pointer-events-auto cursor-pointer"
        style={{ width, height }}
      >
        {/* Icon */}
        <div className="font-mono text-cyan-400 text-xs mb-1 opacity-70 transition-opacity duration-300 group-hover:opacity-100">
          {value.icon}
        </div>

        {/* Title */}
        <div className="font-mono text-white text-sm tracking-wide font-medium leading-tight">
          {value.title}
        </div>

        {/* Subtitle */}
        <div className="font-mono text-cyan-300/50 text-xs tracking-wider mt-1 transition-colors duration-300 group-hover:text-cyan-300/80">
          {value.subtitle}
        </div>

        {/* Info 提示 icon */}
        {value.description && (
          <div
            className={`absolute bottom-2 right-2 transition-all duration-300 ${
              isHovered ? 'opacity-0 scale-75' : 'opacity-60'
            }`}
          >
            <HiOutlineInformationCircle
              className="text-cyan-400 info-icon-pulse"
              size={16}
            />
          </div>
        )}
      </div>

      {/* Hover 描述 Tooltip */}
      {value.description && (
        <div
          className={`absolute left-1/2 -translate-x-1/2 mt-2 z-50 transition-all duration-300 pointer-events-none ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
          }`}
          style={{ width: tooltipWidth }}
        >
          {/* Tooltip SVG 框架 */}
          <svg
            width={tooltipWidth}
            height={tooltipHeight}
            viewBox={`0 0 ${tooltipWidth} ${tooltipHeight}`}
            className="absolute inset-0"
          >
            <defs>
              <filter id={`tooltip-glow-${value.id}`} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* 箭頭 */}
            <path
              d={`M ${tooltipWidth / 2 - 6} 0 L ${tooltipWidth / 2} -6 L ${tooltipWidth / 2 + 6} 0`}
              fill="rgba(10, 20, 30, 0.95)"
              stroke="#00dafa"
              strokeWidth="1"
            />

            {/* 背景 */}
            <path
              d={`M 10 0 H ${tooltipWidth - 10} L ${tooltipWidth} 10 V ${tooltipHeight - 10} L ${tooltipWidth - 10} ${tooltipHeight} H 10 L 0 ${tooltipHeight - 10} V 10 Z`}
              fill="rgba(10, 20, 30, 0.95)"
              stroke="rgba(0, 218, 250, 0.5)"
              strokeWidth="1"
            />
          </svg>

          {/* 描述文字 */}
          <p
            className="relative font-mono text-white/80 text-xs leading-relaxed px-5 py-4"
            style={{ minHeight: tooltipHeight }}
          >
            {value.description}
          </p>
        </div>
      )}

      {/* CSS 動畫 */}
      <style>{`
        .ray-path {
          animation: travel 4s linear infinite, glowPulse 2s ease-in-out infinite alternate;
        }

        @keyframes travel {
          to {
            stroke-dashoffset: -520;
          }
        }

        @keyframes glowPulse {
          0% {
            filter: drop-shadow(0 0 2px #00dafa);
          }
          100% {
            filter: drop-shadow(0 0 6px #00dafa);
          }
        }

        .info-icon-pulse {
          animation: iconPulse 2s ease-in-out infinite;
        }

        @keyframes iconPulse {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  )
}
