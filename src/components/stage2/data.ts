/**
 * Stage 2 - Project Galaxy 資料
 * 從 resume.json 載入作品集資料
 */

import type { Project, GlowColor } from './types'
import type { Language } from '../../i18n'
import { getPortfolio } from '../../data/resume'

// 光暈顏色輪替
const GLOW_COLORS: GlowColor[] = ['cyan', 'purple', 'blue', 'pink', 'green', 'orange', 'yellow']

/**
 * 取得專案資料
 */
export function getProjectData(lang: Language): Project[] {
  const portfolio = getPortfolio(lang)

  return portfolio.map((item, index) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    thumbnail: item.thumbnail,
    tags: item.tags,
    link: item.link,
    glowColor: GLOW_COLORS[index % GLOW_COLORS.length],
  }))
}

// 保留向後相容的靜態資料匯出
export const projectData = getProjectData('en')
