/**
 * SkillCategory - 單個技能類別組件
 * 顯示技能名稱、標籤列表和進度條
 */

import type { SkillCategory as SkillCategoryType } from './types'
import { SKILL_COLORS } from './types'
import ProgressBar from './ProgressBar'

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
  const colors = SKILL_COLORS[category.color]

  return (
    <div className="mb-5 md:mb-5 last:mb-0">
      {/* 類別標題 - 終端機風格 */}
      <div className={`font-mono text-sm md:text-sm mb-1 ${colors.text}`}>
        <span className="text-white/60">&gt; </span>
        {category.name}
        <span className="animate-pulse">_</span>
      </div>

      {/* 技能標籤列表 */}
      <div className="font-mono text-xs text-white/50 mb-2 md:mb-2">
        [{category.skills.join(', ')}]
      </div>

      {/* 進度條 */}
      <ProgressBar
        percentage={category.proficiency}
        color={category.color}
        animate={animate}
        delay={delay}
      />
    </div>
  )
}
