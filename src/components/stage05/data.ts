/**
 * Stage 0.5 - Core Values 資料
 */

import type { Language } from '../../i18n'
import type { CoreValue } from './types'

// 核心價值資料（中文）
const coreValuesZh: CoreValue[] = [
  {
    id: 'fullstack',
    icon: '///',
    title: '全端技術',
    subtitle: '高適應力',
    description: '不受限於特定語言，熟練 React/Vue 與 NestJS/Laravel 生態。擅長根據專案需求快速掌握新技術，解決核心問題。',
  },
  {
    id: 'product',
    icon: '0->1',
    title: '0→1 產品',
    subtitle: '實戰派',
    description: '具備豐富的接案與獨立開發經驗，擅長將模糊的商業需求轉化為落地技術，是工程團隊與商業邏輯間的最佳橋樑。',
  },
  {
    id: 'ai',
    icon: '>_',
    title: 'AI 驅動',
    subtitle: '高效工作流',
    description: '建立從調研、設計到 QA 的 AI 協作體系。能善用工具優化開發全流程，大幅提升產出效率與程式品質。',
  },
  {
    id: 'team',
    icon: '</>',
    title: '團隊協作者',
    subtitle: '動靜皆宜',
    description: '兼具熱情的創意思考與冷靜的邏輯實作能力。既能作為團隊溝通的潤滑劑，也能專注於穩定輸出高品質代碼。',
  },
  {
    id: 'culture',
    icon: '***',
    title: '生活與靈感',
    subtitle: '有靈魂開發者',
    description: '熱愛音樂、藝術、文創與遊戲。深信豐富的生活體驗能為產品注入溫度，致力於成為有技術也有靈魂的開發者。',
  },
]

// 核心價值資料（英文）
const coreValuesEn: CoreValue[] = [
  {
    id: 'fullstack',
    icon: '///',
    title: 'Full-Stack',
    subtitle: 'High Adaptability',
    description: 'Not limited to specific languages. Proficient in React/Vue and NestJS/Laravel ecosystems. Quick to master new technologies based on project needs.',
  },
  {
    id: 'product',
    icon: '0->1',
    title: '0→1 Product',
    subtitle: 'Hands-On Builder',
    description: 'Rich experience in freelance and indie development. Skilled at transforming vague business needs into technical solutions—bridging engineering and business.',
  },
  {
    id: 'ai',
    icon: '>_',
    title: 'AI-Driven',
    subtitle: 'Efficient Workflow',
    description: 'Built an AI collaboration system from research to QA. Leveraging tools to optimize the entire development process, boosting efficiency and code quality.',
  },
  {
    id: 'team',
    icon: '</>',
    title: 'Collaborator',
    subtitle: 'Dynamic & Focused',
    description: 'Combining passionate creative thinking with calm logical execution. Can facilitate team communication while delivering high-quality code consistently.',
  },
  {
    id: 'culture',
    icon: '***',
    title: 'Life & Inspiration',
    subtitle: 'Soulful Developer',
    description: 'Passionate about music, art, creative culture and games. Believing rich life experiences bring warmth to products—a developer with both skills and soul.',
  },
]

/**
 * 根據語言取得核心價值資料
 */
export function getCoreValuesData(language: Language): CoreValue[] {
  return language === 'zh' ? coreValuesZh : coreValuesEn
}
