/**
 * Resume Data - 從 resume.json 載入並支援 i18n
 */

import type { Language } from '../i18n'

// ===== 原始 JSON 資料結構 =====
export interface ResumeExperience {
  id: string
  company: string
  companyEn: string
  title: string
  titleEn: string
  period: string[]  // ["2023/11", "2026/01"] or ["long-term"]
  responsibilities: string[]
  responsibilitiesEn: string[]
  techStack: string[]
}

export interface ResumeSkill {
  id: string
  name: string
  level: number
  technologies: string[]
}

export interface ResumePortfolio {
  id: string
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  tags: string[]
  type: string
  thumbnail: string
  link?: string
}

export interface ResumeContact {
  email: string
  linkedin: string
  github: string
  line: string
}

export interface ResumeData {
  experience: ResumeExperience[]
  skills: ResumeSkill[]
  portfolio: ResumePortfolio[]
  contact: ResumeContact
}

// ===== 載入 Resume 資料 =====
import resumeJson from './resume.json'

export const resumeData: ResumeData = resumeJson as ResumeData

// ===== i18n Helper Functions =====

/**
 * 根據語言取得經歷資料
 */
export function getExperience(lang: Language) {
  return resumeData.experience.map(exp => ({
    id: exp.id,
    company: lang === 'zh' ? exp.company : exp.companyEn,
    title: lang === 'zh' ? exp.title : exp.titleEn,
    period: exp.period,
    responsibilities: lang === 'zh' ? exp.responsibilities : exp.responsibilitiesEn,
    techStack: exp.techStack,
  }))
}

/**
 * 根據語言取得作品集資料
 */
export function getPortfolio(lang: Language) {
  return resumeData.portfolio.map(item => ({
    id: item.id,
    name: lang === 'zh' ? item.name : item.nameEn,
    description: lang === 'zh' ? item.description : item.descriptionEn,
    tags: item.tags,
    type: item.type,
    thumbnail: item.thumbnail,
    link: item.link,
  }))
}

/**
 * 取得技能資料（不需 i18n）
 */
export function getSkills() {
  return resumeData.skills
}

/**
 * 取得聯絡資料
 */
export function getContact() {
  return resumeData.contact
}

/**
 * 格式化經歷時間
 */
export function formatPeriod(period: string[], lang: Language): string {
  if (period[0] === 'long-term') {
    return lang === 'zh' ? '長期合作' : 'Long-term'
  }

  const start = period[0]
  const end = period[1] === 'now'
    ? (lang === 'zh' ? '至今' : 'Present')
    : period[1]

  return `${start} - ${end}`
}
