/**
 * English translations
 */

export type Language = 'en' | 'zh'

export interface Translations {
  lang: Language
  // Stage 0
  softwareEngineer: string
  hoverToEngage: string
  // Stage 0.5
  coreValuesTitle: string
  // Stage 1
  skillDashboardTitle: string
  // Common
  scrollToExplore: string
}

export const en: Translations = {
  lang: 'en',
  // Stage 0
  softwareEngineer: 'Software Engineer',
  hoverToEngage: 'Hover to Engage',
  // Stage 0.5
  coreValuesTitle: 'Core Values',
  // Stage 1
  skillDashboardTitle: 'Skill Proficiency Dashboard',
  // Common
  scrollToExplore: 'Scroll to Explore',
}
