/**
 * ProjectCard - 專案詳情卡片
 * 桌面版：科幻風格卡片，定位在星球旁邊
 * 手機版：全屏 Modal 置中顯示
 */

import { useRef, useMemo } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import type { Project } from './types'
import { GLOW_COLORS } from './types'

interface ProjectCardProps {
  project: Project
  planetPosition: { x: number; y: number }  // 星球位置百分比
  onClose: () => void
}

export default function ProjectCard({
  project,
  planetPosition,
  onClose,
}: ProjectCardProps) {
  const mobileCardRef = useRef<HTMLDivElement>(null)
  const desktopCardRef = useRef<HTMLDivElement>(null)
  const colors = GLOW_COLORS[project.glowColor]

  // 桌面版：計算卡片位置（避開星球）
  const desktopStyle = useMemo(() => {
    // 如果星球在右半邊，卡片顯示在左邊；反之亦然
    const showOnRight = planetPosition.x < 50

    if (showOnRight) {
      return {
        left: `${Math.min(planetPosition.x + 15, 55)}%`,
        right: 'auto',
        top: `${Math.max(20, Math.min(planetPosition.y - 10, 50))}%`,
      }
    } else {
      return {
        left: 'auto',
        right: `${Math.min(100 - planetPosition.x + 15, 55)}%`,
        top: `${Math.max(20, Math.min(planetPosition.y - 10, 50))}%`,
      }
    }
  }, [planetPosition])

  // 進場動畫
  useGSAP(() => {
    const targets = [mobileCardRef.current, desktopCardRef.current].filter(Boolean)
    if (targets.length === 0) return

    gsap.fromTo(
      targets,
      { scale: 0.8, opacity: 0, y: 20 },
      {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: 'power2.out',
      }
    )
  }, { dependencies: [project.id] })

  // 點擊背景關閉
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <>
      {/* ===== 手機版 Modal ===== */}
      <div
        className="md:hidden fixed inset-0 z-40 flex items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        {/* 背景遮罩 */}
        <div className="absolute inset-0 bg-black/70" />

        {/* Modal 卡片 */}
        <div
          ref={mobileCardRef}
          className="relative w-full max-w-sm pointer-events-auto"
          style={{ opacity: 0 }}
        >
          <div
            className="relative bg-black/90 border rounded-lg overflow-hidden"
            style={{
              borderColor: `${colors.primary}50`,
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          >
            {/* 角落裝飾 */}
            <div
              className="absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2"
              style={{ borderColor: colors.primary }}
            />
            <div
              className="absolute -top-px -right-px w-4 h-4 border-t-2 border-r-2"
              style={{ borderColor: colors.primary }}
            />
            <div
              className="absolute -bottom-px -left-px w-4 h-4 border-b-2 border-l-2"
              style={{ borderColor: colors.primary }}
            />
            <div
              className="absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2"
              style={{ borderColor: colors.primary }}
            />

            {/* 專案縮圖 */}
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src={project.thumbnail}
                alt={project.name}
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to top, rgba(0,0,0,0.95) 0%, transparent 60%)`,
                }}
              />
            </div>

            {/* 內容區域 */}
            <div className="p-5">
              {/* 專案標題 */}
              <div className="font-mono text-xs text-white/50 mb-1 tracking-wider">
                PROJECT:
              </div>
              <h3
                className="font-mono text-xl font-bold tracking-wider uppercase mb-3"
                style={{ color: colors.primary }}
              >
                {project.name}
              </h3>

              {/* 專案描述 */}
              <p className="font-mono text-sm text-white/70 leading-relaxed mb-4">
                {project.description}
              </p>

              {/* 技術標籤 */}
              <div className="flex flex-wrap gap-2 mb-5">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-xs px-2 py-1 rounded border"
                    style={{
                      borderColor: `${colors.primary}40`,
                      color: colors.primary,
                      backgroundColor: `${colors.primary}10`,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA 按鈕 */}
              <div className="flex gap-3">
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 font-mono text-sm text-center py-3 border rounded transition-all duration-200 hover:bg-white/10"
                    style={{
                      borderColor: colors.primary,
                      color: colors.primary,
                    }}
                  >
                    VIEW PROJECT
                  </a>
                )}
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm text-center py-3 px-5 border border-white/30 text-white/70 rounded transition-all duration-200 hover:bg-white/10 hover:border-white/50"
                  >
                    GitHub
                  </a>
                )}
              </div>
            </div>

            {/* 關閉按鈕 */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white/70 hover:text-white hover:bg-black/70 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M1 1L13 13M1 13L13 1"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ===== 桌面版卡片 ===== */}
      <div
        className="hidden md:block absolute inset-0 z-30"
        onClick={handleBackdropClick}
      >
        <div
          ref={desktopCardRef}
          className="absolute w-[380px] pointer-events-auto"
          style={{
            ...desktopStyle,
            opacity: 0,
          }}
        >
          <div
            className="relative bg-black/90 border-2 rounded-xl overflow-hidden"
            style={{
              borderColor: `${colors.primary}60`,
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            {/* 角落裝飾 */}
            <div
              className="absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 z-10"
              style={{ borderColor: colors.primary }}
            />
            <div
              className="absolute -top-px -right-px w-4 h-4 border-t-2 border-r-2 z-10"
              style={{ borderColor: colors.primary }}
            />
            <div
              className="absolute -bottom-px -left-px w-4 h-4 border-b-2 border-l-2 z-10"
              style={{ borderColor: colors.primary }}
            />
            <div
              className="absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 z-10"
              style={{ borderColor: colors.primary }}
            />

            {/* 專案縮圖 - 全寬無內距 */}
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src={project.thumbnail}
                alt={project.name}
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 40%)`,
                }}
              />
            </div>

            {/* 內容區域 - 有內距 */}
            <div className="p-6">
              {/* 專案標題 */}
              <div className="font-mono text-xs text-white/50 mb-1 tracking-wider">
                PROJECT:
              </div>
              <h3
                className="font-mono text-xl font-bold tracking-wider uppercase mb-4"
                style={{ color: colors.primary }}
              >
                {project.name}
              </h3>

              {/* 專案描述 */}
              <p className="font-mono text-sm text-white/70 leading-relaxed mb-5">
                {project.description}
              </p>

              {/* 技術標籤 */}
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-xs px-3 py-1.5 rounded border"
                    style={{
                      borderColor: `${colors.primary}40`,
                      color: colors.primary,
                      backgroundColor: `${colors.primary}10`,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA 按鈕區域 - 獨立區塊 */}
            <div className="px-6 pb-6 pt-2">
              <div className="flex gap-3">
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 font-mono text-sm text-center py-3 border rounded transition-all duration-200 hover:bg-white/10"
                    style={{
                      borderColor: colors.primary,
                      color: colors.primary,
                    }}
                  >
                    VIEW PROJECT
                  </a>
                )}
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm text-center py-3 px-5 border border-white/30 text-white/70 rounded transition-all duration-200 hover:bg-white/10 hover:border-white/50"
                  >
                    GitHub
                  </a>
                )}
              </div>
            </div>

            {/* 關閉按鈕 */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white/60 hover:text-white hover:bg-black/70 transition-all z-10"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M1 1L13 13M1 13L13 1"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
