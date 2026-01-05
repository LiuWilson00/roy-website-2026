# Stage 1 Skills 區塊重新設計

## 1. 問題分析

### 現有問題
- 進度條百分比（95%、80%、70%）過於主觀，無實際意義
- 用戶反應 `>` 符號看起來像可展開，但實際無法互動
- 缺乏具體成就描述，無法展現實際能力

### 設計目標
- 用客觀的「年資」取代主觀的「百分比」
- 加入可展開的成就描述，展現實際經歷
- 保持終端機風格的視覺一致性

---

## 2. 新資料結構

### 2.1 修改 `resume.json` 的 skills 結構

```json
{
  "skills": [
    {
      "id": "frontend",
      "name": "Frontend",
      "years": "7+",
      "technologies": [
        "React", "Vue", "TypeScript", "Next.js",
        "Nuxt.js", "React Native", "Angular", "Tailwind CSS"
      ],
      "highlights": [
        "完成/維護超過 20 個產品級應用",
        "精通 React、Vue、Angular 等主流框架",
        "具備 WASM 整合與效能優化經驗",
        "跨平台開發經驗（React Native、Swift、Kotlin）"
      ],
      "highlightsEn": [
        "Delivered & maintained 20+ production applications",
        "Proficient in React, Vue, Angular frameworks",
        "WASM integration & performance optimization",
        "Cross-platform development (React Native, Swift, Kotlin)"
      ]
    },
    {
      "id": "backend",
      "name": "Backend",
      "years": "5+",
      "technologies": [
        "Node.js", "NestJS", "Express", "Laravel",
        "Python", "MySQL", "PostgreSQL", "MongoDB"
      ],
      "highlights": [
        "參與超過 10 個後端服務開發",
        "本地 LLM 整合與 AI 應用開發",
        "微服務架構設計與系統重構",
        "資料庫查詢效能調校與優化"
      ],
      "highlightsEn": [
        "Contributed to 10+ backend services",
        "Local LLM integration & AI application development",
        "Microservices architecture design & refactoring",
        "Database query performance tuning & optimization"
      ]
    },
    {
      "id": "devops",
      "name": "DevOps",
      "years": "2+",
      "technologies": [
        "Docker", "AWS", "GCP", "GitHub Actions", "nginx", "Linux"
      ],
      "highlights": [
        "從零建置企業級服務部署流程",
        "熟悉 AWS、GCP 等主流雲端服務",
        "獨立建制多個專案的 CI/CD Pipeline"
      ],
      "highlightsEn": [
        "Built enterprise-grade deployment from scratch",
        "Proficient in AWS, GCP cloud services",
        "Independently set up CI/CD pipelines for multiple projects"
      ]
    }
  ]
}
```

### 2.2 修改 TypeScript 類型定義

**檔案**: `src/components/stage1/types.ts`

```typescript
// 新增 SkillCategory 結構
export interface SkillCategory {
  id: string
  name: string
  years: string              // 新增：年資（如 "7+"）
  skills: string[]           // technologies
  highlights: string[]       // 新增：成就描述
  highlightsEn: string[]     // 新增：英文成就描述
  color: 'cyan' | 'magenta' | 'blue'
}
```

---

## 3. UI 設計

### 3.1 收合狀態（預設）

```
┌─────────────────────────────────────────┐
│ > SKILL PROFICIENCY                     │
├─────────────────────────────────────────┤
│ ▶ FRONTEND                    7+ years  │
│   [React · Vue · TypeScript · Next.js]  │
├─────────────────────────────────────────┤
│ ▶ BACKEND                     5+ years  │
│   [Node.js · NestJS · Laravel · Python] │
├─────────────────────────────────────────┤
│ ▶ DEVOPS                      2+ years  │
│   [Docker · AWS · GCP · CI/CD]          │
└─────────────────────────────────────────┘
```

### 3.2 展開狀態（點擊後）

```
┌─────────────────────────────────────────┐
│ ▼ FRONTEND                    7+ years  │
│   • 完成/維護超過 20 個產品級應用        │
│   • 精通 React、Vue、Angular 等主流框架  │
│   • 具備 WASM 整合與效能優化經驗         │
│   • 跨平台開發經驗                       │
│   [React · Vue · TypeScript · Next.js]  │
└─────────────────────────────────────────┘
```

### 3.3 視覺元素

| 元素 | 收合 | 展開 |
|------|------|------|
| 圖示 | `▶` 或 `>` | `▼` 或 `v` |
| 類別名稱 | 顯示 | 顯示 |
| 年資 | 顯示 | 顯示 |
| 成就列表 | 隱藏 | 顯示（動畫展開） |
| 技術標籤 | 顯示 | 顯示 |

---

## 4. 組件修改

### 4.1 SkillCategory.tsx 修改

```tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// 或使用 GSAP

interface SkillCategoryProps {
  category: SkillCategory
  animate?: boolean
  delay?: number
}

export default function SkillCategory({ category, animate, delay }: SkillCategoryProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const colors = SKILL_COLORS[category.color]

  return (
    <div className="mb-4 last:mb-0">
      {/* 可點擊的標題區域 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity"
      >
        <div className={`font-mono text-sm ${colors.text} flex items-center gap-2`}>
          {/* 展開/收合圖示 */}
          <span className="text-white/60 w-4">
            {isExpanded ? '▼' : '▶'}
          </span>
          {category.name}
          <span className="animate-pulse">_</span>
        </div>

        {/* 年資標籤 */}
        <span className={`font-mono text-xs ${colors.text} opacity-80`}>
          {category.years} years
        </span>
      </button>

      {/* 成就列表（展開時顯示） */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <ul className="mt-2 ml-6 space-y-1">
              {category.highlights.map((highlight, idx) => (
                <li key={idx} className="font-mono text-xs text-white/70 flex items-start gap-2">
                  <span className={colors.text}>•</span>
                  {highlight}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 技術標籤 */}
      <div className="font-mono text-xs text-white/50 mt-2 ml-6">
        [{category.skills.join(' · ')}]
      </div>
    </div>
  )
}
```

### 4.2 移除 ProgressBar

- 刪除 `ProgressBar.tsx` 組件
- 從 `SkillCategory.tsx` 移除進度條相關程式碼
- 從類型定義移除 `proficiency` / `level` 欄位

---

## 5. 資料更新

### 5.1 更新 `src/data/resume.json`

將現有的 skills 陣列替換為：

```json
"skills": [
  {
    "id": "frontend",
    "name": "Frontend",
    "years": "7+",
    "technologies": [
      "React", "Vue", "TypeScript", "Next.js",
      "Nuxt.js", "React Native", "Angular", "Tailwind CSS"
    ],
    "highlights": [
      "完成/維護超過 20 個產品級應用",
      "精通 React、Vue、Angular 等主流框架",
      "具備 WASM 整合與效能優化經驗",
      "跨平台開發經驗（React Native、Swift、Kotlin）"
    ],
    "highlightsEn": [
      "Delivered & maintained 20+ production applications",
      "Proficient in React, Vue, Angular frameworks",
      "WASM integration & performance optimization",
      "Cross-platform development (React Native, Swift, Kotlin)"
    ]
  },
  {
    "id": "backend",
    "name": "Backend",
    "years": "5+",
    "technologies": [
      "Node.js", "NestJS", "Express", "Laravel",
      "Python", "MySQL", "PostgreSQL", "MongoDB"
    ],
    "highlights": [
      "參與超過 10 個後端服務開發",
      "本地 LLM 整合與 AI 應用開發",
      "微服務架構設計與系統重構",
      "資料庫查詢效能調校與優化"
    ],
    "highlightsEn": [
      "Contributed to 10+ backend services",
      "Local LLM integration & AI application development",
      "Microservices architecture design & refactoring",
      "Database query performance tuning & optimization"
    ]
  },
  {
    "id": "devops",
    "name": "DevOps",
    "years": "2+",
    "technologies": [
      "Docker", "AWS", "GCP", "GitHub Actions", "nginx", "Linux"
    ],
    "highlights": [
      "從零建置企業級服務部署流程",
      "熟悉 AWS、GCP 等主流雲端服務",
      "獨立建制多個專案的 CI/CD Pipeline"
    ],
    "highlightsEn": [
      "Built enterprise-grade deployment from scratch",
      "Proficient in AWS, GCP cloud services",
      "Independently set up CI/CD pipelines for multiple projects"
    ]
  }
]
```

### 5.2 更新 data.ts

**檔案**: `src/components/stage1/data.ts`

```typescript
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
```

---

## 6. 動畫效果

### 6.1 展開/收合動畫（使用 GSAP）

```typescript
// 如果不想引入 framer-motion，可使用現有的 GSAP
import gsap from 'gsap'

const toggleExpand = () => {
  const content = contentRef.current
  if (!content) return

  if (isExpanded) {
    // 收合
    gsap.to(content, {
      height: 0,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.inOut',
      onComplete: () => setIsExpanded(false)
    })
  } else {
    // 展開
    setIsExpanded(true)
    gsap.fromTo(content,
      { height: 0, opacity: 0 },
      { height: 'auto', opacity: 1, duration: 0.3, ease: 'power2.out' }
    )
  }
}
```

### 6.2 Hover 效果

```css
/* 滑鼠懸停時的視覺回饋 */
.skill-header:hover {
  background: rgba(255, 255, 255, 0.05);
}

.skill-header:hover .expand-icon {
  transform: scale(1.1);
}
```

---

## 7. 實作步驟

1. **更新資料結構**
   - [ ] 修改 `src/data/resume.json` 的 skills 陣列
   - [ ] 更新 `src/components/stage1/types.ts` 類型定義
   - [ ] 更新 `src/data/resume.ts` 的介面

2. **修改組件**
   - [ ] 重寫 `SkillCategory.tsx`，加入展開/收合邏輯
   - [ ] 移除 `ProgressBar.tsx`（或保留供其他用途）
   - [ ] 更新 `SkillDashboard.tsx` 傳遞新 props

3. **更新資料轉換**
   - [ ] 修改 `src/components/stage1/data.ts` 的 `getSkillData()`
   - [ ] 支援 i18n（中/英文成就描述）

4. **測試**
   - [ ] 驗證展開/收合動畫流暢
   - [ ] 確認手機版觸控互動正常
   - [ ] 檢查 i18n 切換

---

## 8. 備註

### 為什麼選擇這個方案？

| 方面 | 舊設計（進度條） | 新設計（年資+成就） |
|------|------------------|---------------------|
| 客觀性 | ❌ 主觀百分比 | ✅ 客觀年資 |
| 資訊量 | ❌ 僅顯示技術列表 | ✅ 可展開查看成就 |
| 互動性 | ❌ 純展示 | ✅ 可點擊展開 |
| 用戶期望 | ❌ `>` 看似可點但不能 | ✅ 點擊有回饋 |

### 手機版注意事項
- 預設收合，節省螢幕空間
- 點擊區域要夠大（至少 44px 高度）
- 展開動畫要快（300ms 以內）
