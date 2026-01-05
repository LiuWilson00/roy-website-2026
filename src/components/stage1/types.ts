/**
 * Stage 1 - Profile Overlay Types
 */

// Timeline Entry 資料結構 (符合 resume.json)
export interface TimelineEntry {
  id: string
  company: string
  title: string
  period: string  // 已格式化的時間字串
  responsibilities: string[]
  techStack: string[]
}

// Skill Category 資料結構
export interface SkillCategory {
  id: string
  name: string
  years: string           // 年資（如 "7+"）
  skills: string[]        // technologies
  highlights: string[]    // 成就描述
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

// Stage 1 可見性配置 (現在是 Stage 2 位置，因為新增了 Stage 0.5)
export const STAGE1_VISIBILITY = {
  fadeInStart: 1.5,
  fadeInEnd: 2.0,
  fadeOutStart: 2.5,
  fadeOutEnd: 3.0,
}
