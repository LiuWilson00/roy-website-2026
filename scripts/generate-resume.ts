/**
 * Resume PDF Generator
 * 從 resume.json 生成單頁式履歷 HTML/PDF
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import QRCode from 'qrcode'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ============ 類型定義 ============

interface ResumeExperience {
  id: string
  company: string
  companyEn: string
  title: string
  titleEn: string
  period: string[]
  responsibilities: string[]
  responsibilitiesEn: string[]
  techStack: string[]
}

interface ResumeSkill {
  id: string
  name: string
  level: number
  technologies: string[]
}

interface ResumePortfolio {
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

interface ResumeContact {
  email: string
  linkedin: string
  github: string
  line: string
}

interface ResumeData {
  experience: ResumeExperience[]
  skills: ResumeSkill[]
  portfolio: ResumePortfolio[]
  contact: ResumeContact
}

type Language = 'zh' | 'en'

// ============ 配置 ============

const CONFIG = {
  // 精選經歷 ID（按順序）
  highlightExperience: ['beardo', 'yuntong', 'aiboda', 'authme'],
  // 精選作品 ID（按順序）
  highlightPortfolio: ['laushu', 'virsody', 'authme', 'hanaline', 'better2025'],
  // 個人資訊
  profile: {
    name: 'ROY.DEV',
    realName: '劉威',
    realNameEn: 'Wei Liu',
    title: 'Software Engineer',
    titleZh: '軟體工程師',
    tagline: 'Building Logic from Chaos',
    taglineZh: '從混沌中構建邏輯',
    phone: '0905-171-585',
    location: 'Taipei, Taiwan',
    locationZh: '台北, 台灣',
    website: 'roy-dev.com',
    websiteUrl: 'https://roy-dev.com/',
  },
}

// ============ CSS 樣式 ============

const getStyles = () => `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600&family=Noto+Sans+TC:wght@400;500;600&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary: #00c8ff;
  --primary-dark: #0099cc;
  --primary-glow: rgba(0, 200, 255, 0.15);
  --text-primary: #1a1a2e;
  --text-secondary: #4a4a6a;
  --text-light: #6a6a8a;
  --bg-main: #f8f9fc;
  --bg-card: #ffffff;
  --bg-accent: linear-gradient(135deg, #0d1b2a 0%, #1b263b 100%);
  --border: rgba(0, 200, 255, 0.3);
  --border-light: #e0e4ec;
}

@page {
  size: A4;
  margin: 0;
}

@media print {
  body {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}

body {
  font-family: 'Inter', 'Noto Sans TC', -apple-system, sans-serif;
  font-size: 9pt;
  line-height: 1.4;
  color: var(--text-primary);
  background: var(--bg-main);
}

.page {
  width: 210mm;
  min-height: 297mm;
  padding: 12mm 14mm;
  margin: 0 auto;
  background: var(--bg-main);
  position: relative;
  overflow: hidden;
}

/* 星空背景裝飾 */
.page::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background-image:
    radial-gradient(1px 1px at 20px 30px, rgba(0, 200, 255, 0.3), transparent),
    radial-gradient(1px 1px at 40px 70px, rgba(0, 200, 255, 0.2), transparent),
    radial-gradient(1px 1px at 50px 160px, rgba(0, 200, 255, 0.3), transparent),
    radial-gradient(1px 1px at 90px 40px, rgba(0, 200, 255, 0.2), transparent),
    radial-gradient(1px 1px at 130px 80px, rgba(0, 200, 255, 0.15), transparent),
    radial-gradient(1.5px 1.5px at 160px 120px, rgba(0, 200, 255, 0.25), transparent);
  pointer-events: none;
  opacity: 0.6;
}

/* ===== Header ===== */
.header {
  display: flex;
  gap: 16px;
  margin-bottom: 14px;
  padding: 14px 16px;
  background: var(--bg-accent);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.header::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(1px 1px at 30% 20%, rgba(255,255,255,0.3), transparent),
    radial-gradient(1px 1px at 70% 40%, rgba(255,255,255,0.2), transparent),
    radial-gradient(1px 1px at 20% 60%, rgba(255,255,255,0.25), transparent),
    radial-gradient(1px 1px at 80% 80%, rgba(255,255,255,0.2), transparent),
    radial-gradient(1px 1px at 50% 90%, rgba(255,255,255,0.15), transparent);
  pointer-events: none;
}

.header-left {
  position: relative;
  z-index: 1;
}

.header-right {
  flex: 1;
  position: relative;
  z-index: 1;
}

.avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  border: 2px solid var(--primary);
  box-shadow: 0 0 15px var(--primary-glow), 0 0 30px rgba(0, 200, 255, 0.1);
  object-fit: cover;
}

.name {
  font-family: 'JetBrains Mono', monospace;
  font-size: 22pt;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.15em;
  margin-bottom: 2px;
  text-shadow: 0 0 20px rgba(0, 200, 255, 0.5);
}

.title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10pt;
  color: var(--primary);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.tagline {
  font-size: 8pt;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
  margin-bottom: 8px;
}

.contact-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 8pt;
  color: rgba(255, 255, 255, 0.8);
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.contact-icon {
  width: 12px;
  height: 12px;
  fill: var(--primary);
}

/* ===== Main Content ===== */
.main {
  display: grid;
  grid-template-columns: 1fr 140px;
  gap: 14px;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.right-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ===== Section ===== */
.section {
  background: var(--bg-card);
  border-radius: 6px;
  padding: 10px 12px;
  border: 1px solid var(--border-light);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.section-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9pt;
  font-weight: 600;
  color: var(--primary-dark);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 6px;
}

.section-title::before {
  content: '';
  width: 6px;
  height: 6px;
  background: var(--primary);
  border-radius: 50%;
  box-shadow: 0 0 6px var(--primary);
}

/* ===== Experience ===== */
.exp-item {
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px dashed var(--border-light);
}

.exp-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.exp-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2px;
}

.exp-company {
  font-weight: 600;
  font-size: 9.5pt;
  color: var(--text-primary);
}

.exp-period {
  font-family: 'JetBrains Mono', monospace;
  font-size: 7.5pt;
  color: var(--text-light);
  white-space: nowrap;
}

.exp-title {
  font-size: 8.5pt;
  color: var(--primary-dark);
  margin-bottom: 4px;
}

.exp-list {
  list-style: none;
  padding-left: 0;
}

.exp-list li {
  font-size: 8pt;
  color: var(--text-secondary);
  padding-left: 10px;
  position: relative;
  margin-bottom: 1px;
  line-height: 1.35;
}

.exp-list li::before {
  content: '›';
  position: absolute;
  left: 0;
  color: var(--primary);
  font-weight: bold;
}

.exp-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}

.tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 6.5pt;
  padding: 1px 5px;
  background: var(--primary-glow);
  color: var(--primary-dark);
  border-radius: 3px;
  border: 1px solid var(--border);
}

/* ===== Skills ===== */
.skill-item {
  margin-bottom: 8px;
}

.skill-item:last-child {
  margin-bottom: 0;
}

.skill-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3px;
}

.skill-name {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8pt;
  font-weight: 600;
  color: var(--text-primary);
}

.skill-level {
  font-family: 'JetBrains Mono', monospace;
  font-size: 7pt;
  color: var(--primary-dark);
}

.skill-bar {
  height: 4px;
  background: var(--border-light);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 4px;
}

.skill-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-dark), var(--primary));
  border-radius: 2px;
  box-shadow: 0 0 6px var(--primary-glow);
}

.skill-techs {
  font-size: 6.5pt;
  color: var(--text-light);
  line-height: 1.3;
}

/* ===== Portfolio ===== */
.portfolio-item {
  margin-bottom: 6px;
  padding-bottom: 6px;
  border-bottom: 1px dashed var(--border-light);
}

.portfolio-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.portfolio-name {
  font-weight: 600;
  font-size: 8.5pt;
  color: var(--text-primary);
  margin-bottom: 1px;
}

.portfolio-desc {
  font-size: 7.5pt;
  color: var(--text-secondary);
  line-height: 1.3;
}

.portfolio-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  margin-top: 3px;
}

/* ===== Education (右欄小型) ===== */
.edu-item {
  margin-bottom: 6px;
}

.edu-school {
  font-size: 8pt;
  font-weight: 600;
  color: var(--text-primary);
}

.edu-degree {
  font-size: 7pt;
  color: var(--text-secondary);
}

.edu-year {
  font-family: 'JetBrains Mono', monospace;
  font-size: 7pt;
  color: var(--text-light);
}

/* ===== QR Code ===== */
.qr-section {
  text-align: center;
  padding-top: 8px;
}

.qr-code {
  width: 54px;
  height: 54px;
  margin: 0 auto 4px;
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 2px;
  background: white;
}

.qr-code svg {
  width: 100%;
  height: 100%;
  display: block;
}

.qr-label {
  font-size: 6.5pt;
  color: var(--text-light);
}

/* ===== Footer ===== */
.footer {
  margin-top: 8px;
  text-align: center;
  font-size: 6.5pt;
  color: var(--text-light);
}

.footer a {
  color: var(--primary-dark);
  text-decoration: none;
}
`

// ============ HTML 模板 ============

const generateHTML = (data: ResumeData, lang: Language, qrCodeSvg: string): string => {
  const isZh = lang === 'zh'
  const { profile } = CONFIG

  // 篩選精選經歷
  const experiences = CONFIG.highlightExperience
    .map(id => data.experience.find(e => e.id === id))
    .filter((e): e is ResumeExperience => e !== undefined)

  // 篩選精選作品
  const portfolios = CONFIG.highlightPortfolio
    .map(id => data.portfolio.find(p => p.id === id))
    .filter((p): p is ResumePortfolio => p !== undefined)

  // 格式化時間
  const formatPeriod = (period: string[]): string => {
    if (period[0] === 'long-term') return isZh ? '長期合作' : 'Long-term'
    const end = period[1] === 'now' ? (isZh ? '至今' : 'Present') : period[1]
    return `${period[0]} - ${end}`
  }

  // 經歷 HTML
  const experienceHTML = experiences.map(exp => `
    <div class="exp-item">
      <div class="exp-header">
        <span class="exp-company">${isZh ? exp.company : exp.companyEn}</span>
        <span class="exp-period">${formatPeriod(exp.period)}</span>
      </div>
      <div class="exp-title">${isZh ? exp.title : exp.titleEn}</div>
      <ul class="exp-list">
        ${(isZh ? exp.responsibilities : exp.responsibilitiesEn).slice(0, 3).map(r => `<li>${r}</li>`).join('')}
      </ul>
      <div class="exp-tags">
        ${exp.techStack.slice(0, 5).map(t => `<span class="tag">${t}</span>`).join('')}
      </div>
    </div>
  `).join('')

  // 技能 HTML
  const skillsHTML = data.skills.map(skill => `
    <div class="skill-item">
      <div class="skill-header">
        <span class="skill-name">${skill.name}</span>
        <span class="skill-level">${skill.level}%</span>
      </div>
      <div class="skill-bar">
        <div class="skill-fill" style="width: ${skill.level}%"></div>
      </div>
      <div class="skill-techs">${skill.technologies.slice(0, 6).join(' · ')}</div>
    </div>
  `).join('')

  // 作品集 HTML
  const portfolioHTML = portfolios.map(p => `
    <div class="portfolio-item">
      <div class="portfolio-name">${isZh ? p.name : p.nameEn}</div>
      <div class="portfolio-desc">${isZh ? p.description : p.descriptionEn}</div>
      <div class="portfolio-tags">
        ${p.tags.slice(0, 3).map(t => `<span class="tag">${t}</span>`).join('')}
      </div>
    </div>
  `).join('')

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isZh ? profile.realName : profile.realNameEn} - ${profile.title}</title>
  <style>${getStyles()}</style>
</head>
<body>
  <div class="page">
    <!-- Header -->
    <header class="header">
      <div class="header-left">
        <div class="avatar-placeholder" style="width: 70px; height: 70px; border-radius: 50%; border: 2px solid var(--primary); background: linear-gradient(135deg, #1b263b, #0d1b2a); display: flex; align-items: center; justify-content: center;">
          <span style="font-family: 'JetBrains Mono', monospace; font-size: 20pt; color: var(--primary);">R</span>
        </div>
      </div>
      <div class="header-right">
        <div class="name">${profile.name}</div>
        <div class="title">${isZh ? profile.titleZh : profile.title}</div>
        <div class="tagline">"${isZh ? profile.taglineZh : profile.tagline}"</div>
        <div class="contact-row">
          <span class="contact-item">
            <svg class="contact-icon" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
            ${data.contact.email}
          </span>
          <span class="contact-item">
            <svg class="contact-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
            ${profile.website}
          </span>
          <span class="contact-item">
            <svg class="contact-icon" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            ${isZh ? profile.locationZh : profile.location}
          </span>
          <span class="contact-item">
            <svg class="contact-icon" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
            ${profile.phone}
          </span>
          <span class="contact-item">
            <svg class="contact-icon" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            ${data.contact.github.replace('https://github.com/', '')}
          </span>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main">
      <div class="left-column">
        <!-- Experience -->
        <section class="section">
          <h2 class="section-title">${isZh ? '工作經歷' : 'Experience'}</h2>
          ${experienceHTML}
        </section>

        <!-- Portfolio -->
        <section class="section">
          <h2 class="section-title">${isZh ? '精選作品' : 'Portfolio'}</h2>
          ${portfolioHTML}
        </section>
      </div>

      <div class="right-column">
        <!-- Skills -->
        <section class="section">
          <h2 class="section-title">${isZh ? '技能' : 'Skills'}</h2>
          ${skillsHTML}
        </section>

        <!-- Education -->
        <section class="section">
          <h2 class="section-title">${isZh ? '學歷' : 'Education'}</h2>
          <div class="edu-item">
            <div class="edu-school">${isZh ? '國立中興大學' : 'NCHU'}</div>
            <div class="edu-degree">${isZh ? '資訊科學與工程學系' : 'Computer Science'}</div>
            <div class="edu-year">2014 - 2018</div>
          </div>
        </section>

        <!-- Languages -->
        <section class="section">
          <h2 class="section-title">${isZh ? '語言' : 'Languages'}</h2>
          <div style="font-size: 7.5pt; color: var(--text-secondary);">
            <div style="margin-bottom: 3px;">
              <strong>${isZh ? '中文' : 'Chinese'}</strong>
              <span style="color: var(--text-light);">- ${isZh ? '母語' : 'Native'}</span>
            </div>
            <div>
              <strong>${isZh ? '英文' : 'English'}</strong>
              <span style="color: var(--text-light);">- ${isZh ? '中高級' : 'Professional'}</span>
            </div>
          </div>
        </section>

        <!-- QR Code -->
        <div class="qr-section">
          <div class="qr-code">
            ${qrCodeSvg}
          </div>
          <div class="qr-label">${isZh ? '掃碼查看線上履歷' : 'Scan for online resume'}</div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
      ${isZh ? '更多作品與詳細資訊請訪問' : 'More projects and details at'}
      <a href="https://${profile.website}">${profile.website}</a>
    </footer>
  </div>
</body>
</html>`
}

// ============ 主程式 ============

async function main() {
  const args = process.argv.slice(2)
  const generatePdf = args.includes('--pdf')
  const lang: Language = args.includes('--en') ? 'en' : 'zh'

  // 讀取 resume.json
  const resumePath = path.resolve(__dirname, '../src/data/resume.json')
  const resumeData: ResumeData = JSON.parse(fs.readFileSync(resumePath, 'utf-8'))

  // 確保輸出目錄存在
  const distDir = path.resolve(__dirname, '../dist')
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true })
  }

  // 生成 QR Code SVG
  const qrCodeSvg = await QRCode.toString(CONFIG.profile.websiteUrl, {
    type: 'svg',
    width: 50,
    margin: 0,
    color: {
      dark: '#0099cc',
      light: '#ffffff',
    },
  })

  // 生成 HTML
  const languages: Language[] = args.includes('--all') ? ['zh', 'en'] : [lang]

  for (const l of languages) {
    const html = generateHTML(resumeData, l, qrCodeSvg)
    const htmlPath = path.join(distDir, `resume-${l}.html`)
    fs.writeFileSync(htmlPath, html, 'utf-8')
    console.log(`✅ Generated: ${htmlPath}`)

    // 生成 PDF（如果有 --pdf 參數）
    if (generatePdf) {
      try {
        const puppeteer = await import('puppeteer')
        const browser = await puppeteer.default.launch({ headless: true })
        const page = await browser.newPage()
        await page.setContent(html, { waitUntil: 'networkidle0' })
        const pdfPath = path.join(distDir, `resume-${l}.pdf`)
        await page.pdf({
          path: pdfPath,
          format: 'A4',
          printBackground: true,
          margin: { top: 0, right: 0, bottom: 0, left: 0 },
        })
        await browser.close()
        console.log(`✅ Generated: ${pdfPath}`)
      } catch (err) {
        console.error(`⚠️ PDF generation failed. Please install puppeteer: npm install -D puppeteer`)
        console.log(`   You can also open ${htmlPath} in browser and print to PDF manually.`)
      }
    }
  }

  console.log('\n📄 Resume generation complete!')
  if (!generatePdf) {
    console.log('   Tip: Open the HTML file in browser and use Ctrl+P to save as PDF')
    console.log('   Or run with --pdf flag to auto-generate PDF (requires puppeteer)')
  }
}

main().catch(console.error)
