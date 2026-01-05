/**
 * SkillCategory - 單個技能類別組件
 * 顯示技能名稱、年資、可展開的成就列表和技術標籤
 */

import { useState, useRef, useEffect } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import type { SkillCategory as SkillCategoryType } from './types'
import { SKILL_COLORS } from './types'

interface SkillCategoryProps {
  category: SkillCategoryType
  animate?: boolean
  delay?: number
}

export default function SkillCategory({
  category,
  animate = true,
  delay = 0,
}: SkillCategoryProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const highlightsRef = useRef<HTMLDivElement>(null)
  const isAnimatingRef = useRef(false)
  const colors = SKILL_COLORS[category.color]

  // 進場動畫
  useGSAP(() => {
    if (!animate || !containerRef.current) return

    gsap.fromTo(
      containerRef.current,
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out',
        delay,
      }
    )
  }, { scope: containerRef })

  // 展開/收合動畫
  useEffect(() => {
    const content = highlightsRef.current
    if (!content || isAnimatingRef.current) return

    if (isExpanded) {
      // 展開動畫
      isAnimatingRef.current = true
      gsap.fromTo(
        content,
        { height: 0, opacity: 0 },
        {
          height: 'auto',
          opacity: 1,
          duration: 0.25,
          ease: 'power2.out',
          onComplete: () => {
            isAnimatingRef.current = false
          },
        }
      )
    } else {
      // 收合動畫（僅在已展開過後）
      if (content.style.height !== '0px' && content.style.height !== '') {
        isAnimatingRef.current = true
        gsap.to(content, {
          height: 0,
          opacity: 0,
          duration: 0.25,
          ease: 'power2.inOut',
          onComplete: () => {
            isAnimatingRef.current = false
          },
        })
      }
    }
  }, [isExpanded])

  return (
    <div
      ref={containerRef}
      className="mb-4 md:mb-5 last:mb-0"
      style={{ opacity: animate ? 0 : 1 }}
    >
      {/* 可點擊的標題區域 */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between cursor-pointer group py-1 -my-1 rounded transition-colors hover:bg-white/5"
      >
        <div className={`font-mono text-sm md:text-sm ${colors.text} flex items-center gap-2`}>
          {/* 展開/收合圖示 */}
          <span
            className="text-white/60 w-4 transition-transform duration-200 inline-block"
            style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
          >
            &gt;
          </span>
          {category.name}
          <span className="animate-pulse">_</span>
        </div>

        {/* 年資標籤 */}
        <span className={`font-mono text-xs ${colors.text} opacity-80`}>
          {category.years} years
        </span>
      </button>

      {/* 成就列表（展開時顯示） */}
      <div
        ref={highlightsRef}
        className="overflow-hidden"
        style={{ height: 0, opacity: 0 }}
      >
        <ul className="mt-2 ml-6 space-y-1 pb-1">
          {category.highlights.map((highlight, idx) => (
            <li
              key={idx}
              className="font-mono text-xs text-white/70 flex items-start gap-2"
            >
              <span className={`${colors.text} flex-shrink-0`}>*</span>
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 技術標籤列表 */}
      <div className="font-mono text-xs text-white/50 mt-2 ml-6">
        [{category.skills.join(' | ')}]
      </div>
    </div>
  )
}
