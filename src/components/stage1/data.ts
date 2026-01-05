/**
 * Stage 1 - Profile Data
 * 從 resume.json 載入經歷與技能資料
 */

import type { TimelineEntry, SkillCategory } from './types'
import type { Language } from '../../i18n'
import { getExperience, getSkills, formatPeriod } from '../../data/resume'

// 技能顏色對應
const SKILL_COLOR_MAP: Record<string, 'cyan' | 'magenta' | 'blue'> = {
  frontend: 'cyan',
  backend: 'magenta',
  devops: 'blue',
}

/**
 * 取得 Timeline 經歷資料
 */
export function getTimelineData(lang: Language): TimelineEntry[] {
  const experiences = getExperience(lang)

  return experiences.map(exp => ({
    id: exp.id,
    company: exp.company,
    title: exp.title,
    period: formatPeriod(exp.period, lang),
    responsibilities: exp.responsibilities,
    techStack: exp.techStack,
  }))
}

/**
 * 取得 Skill 技能資料
 */
export function getSkillData(lang: Language): SkillCategory[] {
  const skills = getSkills()

  return skills.map(skill => ({
    id: skill.id,
    name: skill.name.toUpperCase(),
    years: skill.years,
    skills: skill.technologies,
    highlights: lang === 'zh' ? skill.highlights : skill.highlightsEn,
    color: SKILL_COLOR_MAP[skill.id] || 'cyan',
  }))
}

// 保留向後相容的靜態資料匯出（使用英文預設值）
export const timelineData = getTimelineData('en')
export const skillData = getSkillData('en')
