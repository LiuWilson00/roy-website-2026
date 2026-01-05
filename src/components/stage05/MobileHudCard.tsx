/**
 * MobileHudCard - 手機版 HUD 卡片
 * 輪播圖卡片，點擊展開詳情
 */

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { HiX } from 'react-icons/hi'
import type { CoreValue } from './types'

interface MobileHudCardProps {
  value: CoreValue
  index: number
}

export default function MobileHudCard({ value, index }: MobileHudCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // 卡片尺寸 - 輪播圖用較大尺寸
  const width = 260
  const height = 140
  const cut = 16

  // SVG 路徑
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

  return (
    <>
      {/* 卡片 */}
      <div
        className="relative flex-shrink-0 pointer-events-auto"
        onClick={() => value.description && setIsExpanded(true)}
        style={{
          animationDelay: `${index * 0.1}s`,
        }}
      >
        {/* SVG 框架 */}
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="absolute inset-0 pointer-events-none"
        >
          <defs>
            <filter id={`mobile-glow-${value.id}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 背景 */}
          <path d={framePath} fill="rgba(10, 10, 15, 0.9)" />

          {/* 邊框 */}
          <path
            d={framePath}
            fill="none"
            stroke="rgba(0, 218, 250, 0.4)"
            strokeWidth="1"
          />

          {/* 流動光線 */}
          <path
            d={framePath}
            fill="none"
            stroke="#00dafa"
            strokeWidth="2"
            strokeLinecap="round"
            filter={`url(#mobile-glow-${value.id})`}
            className="mobile-ray-path"
            style={{
              strokeDasharray: '80 600',
              strokeDashoffset: 0,
              opacity: 0.6,
            }}
          />

          {/* 角落高光 */}
          <path
            d={`M 0 ${cut + 8} V ${cut} L ${cut} 0 H ${cut + 8}`}
            fill="none"
            stroke="#00dafa"
            strokeWidth="1.5"
            opacity="0.7"
          />
        </svg>

        {/* 內容 */}
        <div
          className="relative px-5 py-4"
          style={{ width, height }}
        >
          {/* Icon */}
          <div className="font-mono text-cyan-400 text-sm opacity-80">
            {value.icon}
          </div>

          {/* Title */}
          <div className="font-mono text-white text-base font-medium leading-tight mt-1">
            {value.title}
          </div>

          {/* Subtitle */}
          <div className="font-mono text-cyan-300/60 text-sm mt-1">
            {value.subtitle}
          </div>

          {/* 點擊提示 */}
          {value.description && (
            <div className="absolute bottom-3 right-4 font-mono text-cyan-400/50 text-[10px] tracking-wider">
              TAP FOR MORE →
            </div>
          )}
        </div>

        {/* CSS 動畫 */}
        <style>{`
          .mobile-ray-path {
            animation: mobileTravel 4s linear infinite;
          }

          @keyframes mobileTravel {
            to {
              stroke-dashoffset: -680;
            }
          }
        `}</style>
      </div>

      {/* 展開的詳情 Modal - 使用 Portal 渲染到 body 避免 overflow hidden 問題 */}
      {isExpanded && value.description && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 pointer-events-auto"
          onClick={() => setIsExpanded(false)}
        >
          {/* 背景遮罩 */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* 詳情卡片 */}
          <div
            className="relative w-full max-w-[300px] animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* SVG 框架 */}
            <svg
              width="100%"
              height="200"
              viewBox="0 0 300 200"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full pointer-events-none"
            >
              <defs>
                <filter id={`modal-glow-${value.id}`} x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* 背景 */}
              <path
                d="M 16 0 H 284 L 300 16 V 184 L 284 200 H 16 L 0 184 V 16 Z"
                fill="rgba(10, 15, 25, 0.98)"
              />

              {/* 邊框 */}
              <path
                d="M 16 0 H 284 L 300 16 V 184 L 284 200 H 16 L 0 184 V 16 Z"
                fill="none"
                stroke="#00dafa"
                strokeWidth="1.5"
                filter={`url(#modal-glow-${value.id})`}
              />

              {/* 角落裝飾 */}
              <path
                d="M 0 30 V 16 L 16 0 H 30"
                fill="none"
                stroke="#00dafa"
                strokeWidth="2"
              />
              <path
                d="M 300 170 V 184 L 284 200 H 270"
                fill="none"
                stroke="#00dafa"
                strokeWidth="2"
              />
            </svg>

            {/* 內容 */}
            <div className="relative p-5">
              {/* 關閉按鈕 */}
              <button
                onClick={() => setIsExpanded(false)}
                className="absolute top-3 right-3 text-cyan-400/60 hover:text-cyan-400 transition-colors"
              >
                <HiX size={20} />
              </button>

              {/* Icon */}
              <div className="font-mono text-cyan-400 text-sm opacity-80">
                {value.icon}
              </div>

              {/* Title */}
              <h3 className="font-mono text-white text-lg font-medium mt-1">
                {value.title}
              </h3>

              {/* Subtitle */}
              <p className="font-mono text-cyan-300/60 text-sm">
                {value.subtitle}
              </p>

              {/* 分隔線 */}
              <div className="h-px bg-cyan-400/20 my-3" />

              {/* Description */}
              <p className="font-mono text-white/80 text-sm leading-relaxed">
                {value.description}
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
