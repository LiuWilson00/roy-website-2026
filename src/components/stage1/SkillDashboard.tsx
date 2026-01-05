/**
 * SkillDashboard - 技能儀表板容器
 * 終端機風格的技能展示面板
 */

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import type { SkillCategory as SkillCategoryType } from './types'
import SkillCategory from './SkillCategory'
import { useLanguage } from '../../i18n'

interface SkillDashboardProps {
  categories: SkillCategoryType[]
  animate?: boolean
}

export default function SkillDashboard({
  categories,
  animate = true,
}: SkillDashboardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { t } = useLanguage()

  useGSAP(() => {
    if (!animate || !containerRef.current) return

    // 容器進場動畫
    gsap.fromTo(
      containerRef.current,
      { x: 80, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
        delay: 0.3,
      }
    )
  }, { scope: containerRef })

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ opacity: animate ? 0 : 1 }}
    >
      {/* 終端機風格容器 */}
      <div className="relative border border-cyan-400/30 bg-black/60 backdrop-blur-sm p-4 rounded-sm">
        {/* 角落裝飾 - 左上 */}
        <div className="absolute -top-px -left-px w-3 h-3 border-t border-l border-cyan-400/60" />
        {/* 角落裝飾 - 右上 */}
        <div className="absolute -top-px -right-px w-3 h-3 border-t border-r border-cyan-400/60" />
        {/* 角落裝飾 - 左下 */}
        <div className="absolute -bottom-px -left-px w-3 h-3 border-b border-l border-cyan-400/60" />
        {/* 角落裝飾 - 右下 */}
        <div className="absolute -bottom-px -right-px w-3 h-3 border-b border-r border-cyan-400/60" />

        {/* 標題 */}
        <div className="font-mono text-sm text-cyan-400 mb-4 pb-2 border-b border-cyan-400/20 uppercase">
          <span className="text-white/60">&gt; </span>
          {t.skillDashboardTitle}
        </div>

        {/* 技能列表 */}
        {categories.map((category, index) => (
          <SkillCategory
            key={category.id}
            category={category}
            animate={animate}
            delay={0.5 + index * 0.2}
          />
        ))}
      </div>
    </div>
  )
}
