/**
 * i18n Context - 國際化上下文
 * 提供語言切換功能，用於內容（經歷、作品）的多語言顯示
 * UI 元素保持英文
 */

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'

// 支援的語言
export type Language = 'en' | 'zh'

// 語言配置
export const LANGUAGES: Record<Language, { label: string; name: string }> = {
  en: { label: 'EN', name: 'English' },
  zh: { label: '中', name: '中文' },
}

// Context 型別
interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
}

// 建立 Context
const I18nContext = createContext<I18nContextType | null>(null)

// LocalStorage Key
const LANGUAGE_STORAGE_KEY = 'preferred-language'

// 取得初始語言（預設英文）
function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'en'

  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
  if (stored === 'zh' || stored === 'en') return stored

  return 'en' // 預設英文
}

// Provider 組件
interface I18nProviderProps {
  children: ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguageState] = useState<Language>('en')
  const [isInitialized, setIsInitialized] = useState(false)

  // 初始化時從 localStorage 讀取
  useEffect(() => {
    const initial = getInitialLanguage()
    setLanguageState(initial)
    setIsInitialized(true)
  }, [])

  // 設定語言
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
    document.documentElement.lang = lang
  }, [])

  // 切換語言
  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'zh' : 'en')
  }, [language, setLanguage])

  // 更新 HTML lang 屬性
  useEffect(() => {
    if (isInitialized) {
      document.documentElement.lang = language
    }
  }, [language, isInitialized])

  const value: I18nContextType = {
    language,
    setLanguage,
    toggleLanguage,
  }

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

// Hook - 取得語言狀態
export function useLanguage() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useLanguage must be used within an I18nProvider')
  }
  return context
}
