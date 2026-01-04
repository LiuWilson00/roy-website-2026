# 單頁式履歷 PDF 生成器規劃

## 1. 概述

從現有網站的 `resume.json` 資料中萃取內容，生成一份符合網站設計風格的單頁式 HTML 履歷，並轉換為 PDF 格式。

### 目標
- 自動從 `src/data/resume.json` 讀取資料
- 生成符合 Cyber Iris 設計風格的 HTML
- 支援中英文雙語版本
- 本地轉換為 A4 尺寸 PDF
- 可透過 npm script 一鍵生成

---

## 2. 技術方案

### 2.1 HTML 生成
使用 Node.js 腳本讀取 `resume.json`，透過模板引擎生成 HTML。

**選項比較：**
| 方案 | 優點 | 缺點 |
|------|------|------|
| 純字串模板 | 零依賴、簡單 | 維護困難 |
| EJS | 語法簡單、支援 JS | 需額外依賴 |
| Handlebars | 邏輯分離清晰 | 學習曲線 |

**推薦：純字串模板**（履歷結構固定，不需複雜模板引擎）

### 2.2 HTML → PDF 轉換
**選項比較：**
| 方案 | 優點 | 缺點 |
|------|------|------|
| Puppeteer | 功能強大、Chrome 渲染 | 依賴大（~300MB） |
| Playwright | 跨瀏覽器、API 優雅 | 依賴大 |
| html-pdf-node | 輕量封裝 Puppeteer | 仍需 Chromium |
| Prince | 專業排版、CSS Paged Media | 商業授權 |
| WeasyPrint | Python、輕量 | 需 Python 環境 |
| **瀏覽器列印** | 零依賴、即時預覽 | 手動操作 |

**推薦方案：雙軌制**
1. **開發/預覽**：生成 HTML，用瀏覽器 `Ctrl+P` 列印為 PDF
2. **自動化**：使用 Puppeteer（已有 MCP server 可能已安裝）

---

## 3. 設計規範

### 3.1 色彩系統（延續網站風格）
```css
:root {
  --primary: #00c8ff;        /* Cyber Blue */
  --primary-dark: #0099cc;
  --text-primary: #ffffff;
  --text-secondary: #a0a0a0;
  --bg-dark: #0a0a0f;
  --bg-card: rgba(0, 20, 40, 0.8);
  --border: rgba(0, 200, 255, 0.3);
  --accent-cyan: #00ffff;
  --accent-magenta: #ff00ff;
}
```

### 3.2 字體
```css
/* 標題 - 等寬字體呼應工程師身份 */
font-family: 'JetBrains Mono', 'Fira Code', monospace;

/* 內文 - 清晰易讀 */
font-family: 'Inter', -apple-system, sans-serif;
```

### 3.3 版面配置（A4: 210mm × 297mm）
```
┌─────────────────────────────────────────┐
│  ┌─────────┐   ROY.DEV                  │
│  │  Photo  │   Software Engineer        │
│  └─────────┘   liuwei811007@gmail.com   │
│                github.com/LiuWilson00   │
├─────────────────────────────────────────┤
│  EXPERIENCE                             │
│  ─────────────────────────────────────  │
│  ● Company A          2023/11 - Present │
│    Title                                │
│    • Responsibility 1                   │
│    • Responsibility 2                   │
│    [Tech] [Stack] [Tags]                │
│                                         │
│  ● Company B          2022/12 - 2023/10 │
│    ...                                  │
├─────────────────────────────────────────┤
│  SKILLS                                 │
│  ─────────────────────────────────────  │
│  Frontend ████████████░░ 95%            │
│  React | Vue | TypeScript | Next.js     │
│                                         │
│  Backend  █████████░░░░░ 80%            │
│  Node.js | NestJS | Laravel | Python    │
├─────────────────────────────────────────┤
│  PORTFOLIO (精選)                        │
│  ─────────────────────────────────────  │
│  • Laushu - 勞報單數位化平台              │
│  • Virsody - 3D 虛擬展覽空間             │
│  • MangaChat - AI 文字轉漫畫平台         │
└─────────────────────────────────────────┘
```

### 3.4 視覺元素
- **發光邊框**：卡片使用 `box-shadow` 模擬科幻光暈
- **點狀裝飾**：標題旁的小圓點呼應 Cyber Iris 粒子
- **漸層背景**：深色漸層 + 微弱星點背景圖

---

## 4. 檔案結構

```
scripts/
├── generate-resume.ts      # 主生成腳本
├── resume-template.ts      # HTML 模板
└── resume-styles.ts        # CSS 樣式

dist/
├── resume-zh.html          # 中文版 HTML
├── resume-en.html          # 英文版 HTML
├── resume-zh.pdf           # 中文版 PDF
└── resume-en.pdf           # 英文版 PDF
```

---

## 5. 實作步驟

### Phase 1: HTML 模板
1. 建立 `scripts/generate-resume.ts`
2. 讀取 `src/data/resume.json`
3. 生成內嵌 CSS 的完整 HTML
4. 輸出到 `dist/resume-{lang}.html`

### Phase 2: 樣式設計
1. 設計符合網站風格的 CSS
2. 確保列印樣式正確（`@media print`）
3. 調整間距確保單頁呈現

### Phase 3: PDF 生成
1. 安裝 Puppeteer（如尚未安裝）
2. 使用 headless Chrome 渲染 HTML
3. 輸出 A4 PDF

### Phase 4: NPM Scripts
```json
{
  "scripts": {
    "resume:html": "tsx scripts/generate-resume.ts",
    "resume:pdf": "tsx scripts/generate-resume.ts --pdf",
    "resume:preview": "tsx scripts/generate-resume.ts && open dist/resume-zh.html"
  }
}
```

---

## 6. 內容篩選

由於是單頁履歷，需要精簡內容：

### 經歷（選擇 3-4 項最相關）
- ✅ 熊熊幹大事（Deep Tech Partner）
- ✅ 云桐科技（Senior Frontend）
- ✅ 愛伯達（Senior Full Stack）
- ✅ 數位身分 Authme（Frontend）
- ⚠️ 博悅（視職缺相關性）
- ❌ YPCloud、桓基（較舊）

### 技能（保留全部 3 類）
- Frontend 95%
- Backend 80%
- DevOps 70%

### 作品集（選擇 3-5 項亮點）
- ✅ Laushu（完整產品）
- ✅ Virsody（3D 技術亮點）
- ✅ MangaChat（AI 整合）
- ⚠️ Hanaline（視情況）

---

## 7. 進階功能（未來）

- [ ] 根據職缺自動調整內容權重
- [ ] 支援自訂主題色
- [ ] QR Code 連結到線上網站
- [ ] GitHub Actions 自動生成

---

## 8. 參考資源

- [Puppeteer PDF API](https://pptr.dev/api/puppeteer.page.pdf)
- [CSS Paged Media](https://www.w3.org/TR/css-page-3/)
- [A4 列印最佳實踐](https://www.smashingmagazine.com/2015/01/designing-for-print-with-css/)
