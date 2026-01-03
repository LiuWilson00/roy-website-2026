/**
 * Stage 1 - Profile Overlay Types
 */

// Timeline Entry 資料結構
export interface TimelineEntry {
  id: string
  year: number
  title: string
  organization: string
  description: string
  type: 'work' | 'education' | 'achievement'
}

// Skill Category 資料結構
export interface SkillCategory {
  id: string
  name: string
  skills: string[]
  proficiency: number  // 0-100
  color: 'cyan' | 'magenta' | 'blue'
}

// 進度條顏色映射
export const SKILL_COLORS = {
  cyan: {
    bar: 'bg-gradient-to-r from-cyan-400 to-cyan-500',
    glow: 'shadow-[0_0_15px_rgba(0,255,255,0.5)]',
    text: 'text-cyan-400',
    border: 'border-cyan-400/30',
  },
  magenta: {
    bar: 'bg-gradient-to-r from-fuchsia-400 to-fuchsia-500',
    glow: 'shadow-[0_0_15px_rgba(255,0,255,0.5)]',
    text: 'text-fuchsia-400',
    border: 'border-fuchsia-400/30',
  },
  blue: {
    bar: 'bg-gradient-to-r from-blue-400 to-blue-500',
    glow: 'shadow-[0_0_15px_rgba(59,130,246,0.5)]',
    text: 'text-blue-400',
    border: 'border-blue-400/30',
  },
} as const

// Stage 1 可見性配置
export const STAGE1_VISIBILITY = {
  fadeInStart: 0.5,
  fadeInEnd: 1.0,
  fadeOutStart: 1.5,
  fadeOutEnd: 2.0,
}
