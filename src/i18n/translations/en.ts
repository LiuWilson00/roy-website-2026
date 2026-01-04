/**
 * English translations
 * UI elements stay in English, only content (experience, projects) needs translation
 */

export type Language = 'en' | 'zh'

export interface Translations {
  lang: Language
}

export const en: Translations = {
  lang: 'en',
}
