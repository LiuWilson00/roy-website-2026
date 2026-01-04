# Content Migration Analysis

## Data Sources Comparison

### 1. Personal Information

| Field | PDF Resume | Old Website |
|-------|------------|-------------|
| Name | 劉為 (Wei Liu / Roy) | Roy Liu |
| Email | assss49@yahoo.com.tw | liuwei811007@gmail.com |
| Phone | 0985-630-944 | N/A |
| LINE | N/A | assss49 |
| LinkedIn | N/A | linkedin.com/in/wei-liu-86666b1b3/ |
| Location | 台北市南港區 | N/A |

**Action**: Merge both contact methods, use Gmail as primary email

---

### 2. Introduction / Summary

**PDF Resume (較正式)**:
> 您好！我是劉為，是一名經驗豐富的開發者，擅長前端(React、Vue)、後端(Laravel、JavaSpringBoot、Express...)、移動端開發(React Native、Kotlin、Swift）同時我也是一位擅長溝通協調的人，也有團隊的帶領經驗，我會是貴公司需要的那個人！

**Old Website (較詳細)**:
> 我是一名軟體工程師，熟悉前端、後端開發，也有資料分析、機器學習、devOps的實務經驗，大學主修應用數學系，對任何最新的技術都充滿好奇心，由於興趣十分廣泛，除了軟體開發及統計以外我也有設計、美術、文字企劃的能力...

**Action**: Combine both - use website's detail with resume's professional tone

---

### 3. Skills Comparison

| Category | PDF Resume | Old Website | Merged |
|----------|------------|-------------|--------|
| Frontend | React, Vue, Angular, jQuery, Next, Nuxt, React Native | React, Vue, HTML/CSS/JS, jQuery | React, Vue, Next.js, TypeScript |
| Backend | Express, Laravel, Spring Boot, ASP.NET | asp.net, express, django, laravel | Node.js, Laravel, Spring Boot |
| Mobile | React Native, Swift, Kotlin | React Native, Swift, Kotlin | Same |
| DevOps | Docker, AWS, GCP, Azure, nginx | CentOS, RHEL, AWS, GCP | AWS, GCP, Docker |
| Database | MySQL, MSSQL, MongoDB | mysql, mssql, mongodb | Same |
| Data/ML | PyTorch, TensorFlow, R, Python | Deep learning, Statistics | Python, ML frameworks |
| Design | Photoshop, Procreate | Adobe XD, AI, PS, Procreate | Figma, Adobe Suite |

---

### 4. Work Experience Comparison

| Period | PDF Resume | Old Website | Notes |
|--------|------------|-------------|-------|
| 2023/11-now | 愛伯達 - 資深全端工程師 | - | Only in PDF |
| 2022/12-2023/10 | 數位身分 - 前端工程師 | Authme (2022-2023) | Same company |
| 2020/5-2022/12 | 博悅 - 資深前端工程師 | POYUE (2020-2022) | Same company |
| 2020/2-2020/5 | YPCloud - 工程師 | YPCloud (2018-2019) | Date mismatch |
| 2018/9-2019/11 | 桓基科技 - 工程師 | 桓基科技 (2017-2018) | Date mismatch |
| 2017/1-2017/12 | 艾婕行銷 - 現場執行督導 | 行銷公司 (2016-2017) | Same type |
| 2016/6-2017/6 | 文化大學 - 助教 | PCCU Student | Different role |
| 2023-2024 | - | ICYBox | Only in website |
| 2025-now | - | YTCloud | Only in website |

**Notes**:
- Website has placeholder text for ICYBox/YTCloud (copy-paste from Authme)
- PDF has more accurate dates and company names
- PDF has detailed responsibilities and tech stacks

---

### 5. Portfolio Projects

**Old Website Portfolio** (6 projects):
1. Reflex - 運動數據分析平台
2. Chat room - 跨平台即時通訊
3. Backstage - 數據管理後台
4. HR System - 人資系統
5. Exchange - 虛擬貨幣交易所
6. Game Center - 遊戲平台

**PDF Resume Achievements** (scattered in work experience):
- 規劃及開發多款即時互動遊戲 (跨平台)
- 規劃及開發客服及聊天軟體
- 規劃及開發電競賽事轉播系統
- SDK 維護與開發

**Action**: Use website portfolio structure, enrich with PDF achievements

---

### 6. Education

| Source | School | Department | Period | Notes |
|--------|--------|------------|--------|-------|
| PDF | 文化大學 | 應用數學系 | 2014/9-2018/6 | 大學肄業 |
| PDF | 大安高工 | 冷凍空調科 | 2008/9-2011/9 | 高職畢業 |
| Website | PCCU | Student | 2012-2016 | Date different |

**Action**: Use PDF dates (more accurate)

---

## Migration Priority

### High Priority (Stage 2 - Project Galaxy)
1. Portfolio projects with images and descriptions
2. Work experience timeline
3. Skills breakdown

### Medium Priority (Stage 3 - Grid Wave / Stage 4)
1. Personal introduction
2. Contact information
3. Education background

### Low Priority (Future)
1. Detailed autobiography
2. Job preferences
3. Certifications

---

## Data Accuracy Issues

1. **Website date discrepancies**: Several experience dates don't match PDF
2. **Placeholder content**: ICYBox and YTCloud have duplicate descriptions
3. **Contact info**: Different emails in different sources
4. **Missing current job**: 愛伯達 (2023-now) not in website

---

## Recommended Final Data Structure

```typescript
interface ResumeData {
  personal: {
    name: { chinese: string; english: string; nickname: string }
    email: string
    linkedin: string
    location: string
    tags: string[]
  }
  summary: string
  skills: SkillCategory[]
  experience: WorkExperience[]
  portfolio: Project[]
  education: Education[]
}
```
