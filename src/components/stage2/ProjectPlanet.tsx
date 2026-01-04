/**
 * ProjectPlanet - 單個專案星球
 * 顯示專案縮圖作為星球表面，具有懸浮動畫和互動效果
 */

import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import type { Project, PlanetSize } from './types'
import { GLOW_COLORS, SIZE_MAP, SIZE_MAP_MOBILE } from './types'

interface ProjectPlanetProps {
  project: Project
  size: PlanetSize
  positionX: number  // 百分比
  positionY: number  // 百分比
  isSelected: boolean
  onClick: () => void
  delay?: number     // 進場動畫延遲
  isMobile?: boolean // 是否為手機版
}

export default function ProjectPlanet({
  project,
  size,
  positionX,
  positionY,
  isSelected,
  onClick,
  delay = 0,
  isMobile = false,
}: ProjectPlanetProps) {
  const planetRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  // 根據裝置選擇尺寸
  const sizeMap = isMobile ? SIZE_MAP_MOBILE : SIZE_MAP
  const planetSize = sizeMap[size]
  const colors = GLOW_COLORS[project.glowColor]

  // 懸浮動畫
  useGSAP(() => {
    if (!planetRef.current) return

    // 進場動畫
    gsap.fromTo(
      planetRef.current,
      { scale: 0, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.6,
        ease: 'back.out(1.7)',
        delay: delay,
      }
    )

    // 懸浮動畫
    gsap.to(planetRef.current, {
      y: -12,
      duration: 2.5 + Math.random(),
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      delay: Math.random() * 2,
    })
  }, { scope: planetRef })

  // 選中/懸浮效果
  useGSAP(() => {
    if (!planetRef.current) return

    if (isSelected || isHovered) {
      gsap.to(planetRef.current, {
        scale: 1.12,
        duration: 0.3,
        ease: 'power2.out',
      })
    } else {
      gsap.to(planetRef.current, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
      })
    }
  }, { dependencies: [isSelected, isHovered] })

  return (
    <div
      ref={planetRef}
      className="absolute cursor-pointer planet"
      style={{
        left: `${positionX}%`,
        top: `${positionY}%`,
        transform: 'translate(-50%, -50%)',
        width: planetSize,
        height: planetSize,
        opacity: 0, // 初始透明，動畫後顯示
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 光暈層 */}
      <div
        className="absolute inset-0 rounded-full transition-all duration-300"
        style={{
          background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
          transform: 'scale(1.8)',
          opacity: isSelected || isHovered ? 0.9 : 0.5,
          filter: `blur(${isSelected || isHovered ? 15 : 10}px)`,
        }}
      />

      {/* 星球本體 */}
      <div
        className="relative w-full h-full rounded-full overflow-hidden"
        style={{
          boxShadow: `
            0 0 ${isSelected || isHovered ? 40 : 20}px ${colors.glow},
            inset -${planetSize * 0.15}px -${planetSize * 0.15}px ${planetSize * 0.3}px rgba(0,0,0,0.6),
            inset ${planetSize * 0.08}px ${planetSize * 0.08}px ${planetSize * 0.15}px rgba(255,255,255,0.1)
          `,
        }}
      >
        {/* 載入佔位 */}
        {!imageLoaded && (
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${colors.primary}40, ${colors.primary}10)`,
            }}
          />
        )}

        {/* 專案圖片 */}
        <img
          src={project.thumbnail}
          alt={project.name}
          className="w-full h-full object-cover"
          style={{
            opacity: imageLoaded ? 1 : 0,
            transition: 'opacity 0.3s',
          }}
          onLoad={() => setImageLoaded(true)}
        />

        {/* 球體光澤效果 */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `
              radial-gradient(
                ellipse 50% 30% at 30% 25%,
                rgba(255,255,255,0.3) 0%,
                transparent 50%
              )
            `,
          }}
        />

        {/* 邊緣陰影 */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            boxShadow: `inset 0 0 ${planetSize * 0.25}px rgba(0,0,0,0.4)`,
          }}
        />
      </div>

      {/* 專案名稱標籤 */}
      <div
        className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-xs tracking-wider uppercase transition-all duration-300 px-2 py-1 rounded"
        style={{
          top: `${planetSize + 8}px`,
          color: colors.primary,
          opacity: isSelected || isHovered ? 1 : 0.8,
          textShadow: `0 0 8px ${colors.glow}, 0 0 16px rgba(0,0,0,0.8)`,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
        }}
      >
        {project.name}
      </div>
    </div>
  )
}
