# Stage 0.5 - Core Values 實作文件

## 概述

在 Stage 0（The Circle）與 Stage 1（The Bloom）之間新增 Stage 0.5，展示個人核心價值與優勢。此階段採用「脈衝波紋」(Pulse Rings) 粒子效果，視覺上介於靜態呼吸圓與動態綻放之間。

---

## 核心內容

### 五大核心優勢

| 中文 | 英文 |
|------|------|
| 全端技術與高適應力 | Full-Stack Expertise & High Adaptability |
| 0 到 1 產品實戰派 | Zero-to-One Product Builder |
| AI 驅動的高效工作流 | AI-Driven Efficient Workflow |
| 動靜皆宜的團隊協作者 | Versatile Team Collaborator |
| 擁抱多元文化的開發者 | Multicultural Developer |

---

## 粒子效果設計：脈衝波紋 (Pulse Rings)

### 設計概念

粒子維持圓形排列，但加入同心環狀的脈衝波動，從圓心向外擴散，視覺效果類似水波漣漪或雷達掃描。

```
視覺示意：
        ╭─────────────────╮
       ╱   ╭─────────╮     ╲
      │   ╱ ╭─────╮   ╲     │
      │  │ ╱ ╭─╮   ╲   │    │  ← 脈衝波紋向外擴散
      │  │ │ (•)   │   │    │
      │  │ ╲ ╰─╯   ╱   │    │
      │   ╲ ╰─────╯   ╱     │
       ╲   ╰─────────╯     ╱
        ╰─────────────────╯
```

### 動畫參數

```typescript
const STAGE05_CONFIG = {
  // 基礎圓形配置（繼承 Stage 0）
  baseRadius: 180,
  breathAmplitude: 0.08,    // 減弱呼吸幅度
  breathSpeed: 0.4,

  // 脈衝波紋配置
  pulse: {
    count: 3,               // 同時存在的波紋數量
    speed: 0.5,             // 波紋擴散速度 (單位/秒)
    maxRadius: 1.5,         // 最大擴散半徑（相對於 baseRadius）
    amplitude: 15,          // 波紋振幅 (px)
    decay: 0.7,             // 衰減曲線
    phaseOffset: 2.094,     // 2π/3，波紋相位差
  },

  // 粒子樣式
  particle: {
    baseSize: 3,
    pulseSize: 4,           // 波紋經過時放大
    baseOpacity: 0.8,
    pulseOpacity: 1,
    glowIntensity: 6,
  },

  // 顏色
  colors: {
    base: 'white',
    pulse: 'hsl(180, 80%, 70%)',  // cyan 漸層
  }
}
```

### 數學公式

```typescript
/**
 * 計算脈衝波紋對粒子的影響
 */
function calculatePulseEffect(
  particle: Particle,
  time: number,
  config: typeof STAGE05_CONFIG.pulse
): { radiusOffset: number; opacity: number; size: number } {
  const normalizedTheta = particle.theta / (Math.PI * 2)

  let totalEffect = 0

  // 計算每個波紋的影響
  for (let i = 0; i < config.count; i++) {
    // 波紋相位（從中心向外擴散）
    const wavePhase = (time * config.speed + i * config.phaseOffset) % config.maxRadius

    // 粒子距離中心的相對距離（基於角度位置模擬距離效果）
    const particlePhase = (normalizedTheta + time * 0.1) % 1

    // 計算波紋與粒子的距離
    const distance = Math.abs(wavePhase - particlePhase * config.maxRadius)

    // 高斯衰減
    const effect = Math.exp(-distance * distance / 0.1) * Math.pow(1 - wavePhase / config.maxRadius, config.decay)

    totalEffect += effect
  }

  // 正規化效果值
  totalEffect = Math.min(1, totalEffect)

  return {
    radiusOffset: totalEffect * config.amplitude,
    opacity: lerp(0.8, 1, totalEffect),
    size: lerp(3, 4, totalEffect),
  }
}
```

### 過渡效果

#### Stage 0 → Stage 0.5

- **進入方式**：呼吸動畫幅度逐漸減小，脈衝波紋強度逐漸增強
- **時間**：scrollProgress 0.3 ~ 0.5 區間
- **插值**：
  ```typescript
  const transitionProgress = clamp((scrollProgress - 0.3) / 0.2, 0, 1)
  const pulseIntensity = easeInOutCubic(transitionProgress)
  const breathAmplitude = lerp(0.12, 0.08, transitionProgress)
  ```

#### Stage 0.5 → Stage 1

- **離開方式**：脈衝波紋向外擴散消失，粒子開始分層旋轉
- **時間**：scrollProgress 0.7 ~ 1.0 區間
- **插值**：
  ```typescript
  const exitProgress = clamp((scrollProgress - 0.7) / 0.3, 0, 1)
  const pulseOpacity = 1 - easeInOutCubic(exitProgress)
  // 開始混入 Stage 1 的分層旋轉
  const layerRotation = easeInOutCubic(exitProgress) * STAGE1_CONFIG.layerSpeed
  ```

---

## Overlay 設計

### 佈局方案

採用**中央聚焦佈局**，五個優勢環繞粒子圓形排列，形成視覺呼應。

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│     ┌───────────────────────────────────────────┐   │
│     │  > CORE VALUES                            │   │
│     └───────────────────────────────────────────┘   │
│                                                     │
│        ╭─────╮                       ╭─────╮        │
│        │  1  │                       │  2  │        │
│        ╰─────╯                       ╰─────╯        │
│                    ╭─────────╮                      │
│                    │         │                      │
│      ╭─────╮       │ Particle│        ╭─────╮       │
│      │  5  │       │  Circle │        │  3  │       │
│      ╰─────╯       │         │        ╰─────╯       │
│                    ╰─────────╯                      │
│                                                     │
│                       ╭─────╮                       │
│                       │  4  │                       │
│                       ╰─────╯                       │
│                                                     │
│         [ SCROLL TO EXPLORE ▼ ]                     │
└─────────────────────────────────────────────────────┘
```

### 組件結構

```
src/components/
├── stage05/
│   ├── index.ts                  # 匯出入口
│   ├── Stage05Overlay.tsx        # 主覆蓋層
│   ├── CoreValueCard.tsx         # 核心優勢卡片
│   ├── types.ts                  # 型別定義
│   └── data.ts                   # 資料定義
```

### CoreValueCard 設計

```typescript
interface CoreValueCardProps {
  value: CoreValue
  index: number
  position: 'top-left' | 'top-right' | 'center-left' | 'center-right' | 'bottom'
  animate?: boolean
  delay?: number
}

// 卡片樣式
const cardStyles = {
  container: `
    relative px-4 py-3
    border border-cyan-400/30
    bg-black/60 backdrop-blur-sm
    rounded-sm
  `,
  icon: `
    w-8 h-8 mb-2
    text-cyan-400
  `,
  title: `
    font-mono text-sm text-white
    tracking-wide
  `,
  subtitle: `
    font-mono text-xs text-white/50
    tracking-wider uppercase
  `,
}
```

### 動畫時序

```typescript
// 卡片進場動畫（依位置交錯）
const entranceDelays = {
  'top-left': 0.2,
  'top-right': 0.3,
  'center-left': 0.4,
  'center-right': 0.5,
  'bottom': 0.6,
}

// GSAP 動畫
gsap.fromTo(cardRef.current,
  { opacity: 0, scale: 0.8, y: 20 },
  {
    opacity: 1,
    scale: 1,
    y: 0,
    duration: 0.6,
    ease: 'back.out(1.2)',
    delay: entranceDelays[position],
  }
)
```

---

## 系統整合

### 1. 滾動進度重新映射

目前容器高度為 `400vh`（4 個 Stage），需要擴展為 `500vh`（5 個 Stage）。

```typescript
// ParticleCanvas.tsx
<div
  ref={containerRef}
  className="relative bg-black"
  style={{ height: '500vh' }}  // 400vh → 500vh
>
```

### 2. Stage 配置更新

```typescript
// ParticleCanvas.tsx
const STAGES: StageDefinition[] = [
  { id: 0, name: 'circle', transform: stage0Transform, sceneState: stage0SceneState },
  { id: 0.5, name: 'pulse-rings', transform: stage05Transform, sceneState: stage05SceneState },  // 新增
  { id: 1, name: 'bloom', transform: stage1Transform, sceneState: stage1SceneState },
  { id: 2, name: 'planetary', transform: stage2Transform, sceneState: stage2SceneState },
  { id: 3, name: 'grid', transform: stage3Transform, sceneState: stage3SceneState },
]
```

### 3. Overlay 可見性調整

所有現有 Overlay 的淡入/淡出範圍需要向後偏移：

```typescript
// 原始 Stage 1 (現在變成 Stage 2)
// IntroOverlay.tsx (Stage 0)
const opacity = Math.max(0, 1 - scrollProgress * 2)  // 保持不變

// Stage05Overlay.tsx (Stage 0.5) - 新增
const VISIBILITY = {
  fadeInStart: 0.3,
  fadeInEnd: 0.5,
  fadeOutStart: 0.7,
  fadeOutEnd: 1.0,
}

// Stage1Overlay.tsx (原本的 Stage 1，現在是 Stage 1.5)
// 需要將所有數值 +0.5
const VISIBILITY = {
  fadeInStart: 1.0,   // 原 0.5 → 1.0
  fadeInEnd: 1.5,     // 原 1.0 → 1.5
  fadeOutStart: 2.0,  // 原 1.5 → 2.0
  fadeOutEnd: 2.5,    // 原 2.0 → 2.5
}

// Stage2Overlay.tsx (原本的 Stage 2，現在是 Stage 2.5)
const VISIBILITY = {
  fadeInStart: 2.0,   // 原 1.5 → 2.0
  fadeInEnd: 2.5,     // 原 2.0 → 2.5
  fadeOutStart: 3.0,  // 原 2.5 → 3.0
  fadeOutEnd: 3.5,    // 原 3.0 → 3.5
}

// Stage4Overlay.tsx (Stage 3，現在是 Stage 4)
const VISIBILITY = {
  fadeInStart: 3.0,   // 原 2.5 → 3.0
  fadeInEnd: 3.5,     // 原 3.0 → 3.5
  // 最後一個 Stage，不需要 fadeOut
}
```

### 4. 粒子過渡邏輯

```typescript
// useStageComputation.ts
function computeParticleState({ particleIndex, context, scrollProgress }): ParticleState {
  const progress = scrollProgress

  // Stage 0 → Stage 0.5
  if (progress < 0.5) {
    const t = clamp(progress / 0.5, 0, 1)
    return interpolateState(
      stage0Transform(particle, context),
      stage05Transform(particle, context),
      t
    )
  }

  // Stage 0.5 → Stage 1
  if (progress < 1.0) {
    const t = clamp((progress - 0.5) / 0.5, 0, 1)
    return interpolateState(
      stage05Transform(particle, context),
      stage1Transform(particle, context),
      t
    )
  }

  // 後續 Stage...
}
```

---

## 檔案清單

### 新增檔案

| 路徑 | 說明 |
|------|------|
| `src/particles/transforms/stage05-pulse.ts` | Stage 0.5 粒子變換函數 |
| `src/components/stage05/index.ts` | 組件匯出入口 |
| `src/components/stage05/Stage05Overlay.tsx` | 主覆蓋層組件 |
| `src/components/stage05/CoreValueCard.tsx` | 核心優勢卡片組件 |
| `src/components/stage05/types.ts` | 型別定義 |
| `src/components/stage05/data.ts` | 資料定義（含 i18n） |

### 修改檔案

| 路徑 | 修改內容 |
|------|----------|
| `src/particles/transforms/index.ts` | 匯出 stage05Transform |
| `src/components/ParticleCanvas.tsx` | 容器高度、Stage 配置、匯入 Stage05Overlay |
| `src/components/stage1/Stage1Overlay.tsx` | 調整可見性範圍 |
| `src/components/stage2/Stage2Overlay.tsx` | 調整可見性範圍 |
| `src/components/stage4/Stage4Overlay.tsx` | 調整可見性範圍 |
| `src/hooks/useStageComputation.ts` | 新增 Stage 0.5 過渡邏輯 |
| `src/i18n/translations/en.ts` | 新增翻譯 |
| `src/i18n/translations/zh.ts` | 新增翻譯 |

---

## i18n 翻譯

### en.ts

```typescript
// Stage 0.5
coreValuesTitle: 'Core Values',
coreValue1Title: 'Full-Stack Expertise',
coreValue1Desc: 'High Adaptability',
coreValue2Title: 'Zero-to-One Builder',
coreValue2Desc: 'Product Execution',
coreValue3Title: 'AI-Driven Workflow',
coreValue3Desc: 'Efficient Development',
coreValue4Title: 'Team Collaborator',
coreValue4Desc: 'Versatile Communication',
coreValue5Title: 'Multicultural Developer',
coreValue5Desc: 'Global Perspective',
```

### zh.ts

```typescript
// Stage 0.5
coreValuesTitle: '核心優勢',
coreValue1Title: '全端技術',
coreValue1Desc: '高適應力',
coreValue2Title: '0 到 1 產品',
coreValue2Desc: '實戰經驗',
coreValue3Title: 'AI 驅動',
coreValue3Desc: '高效工作流',
coreValue4Title: '團隊協作',
coreValue4Desc: '動靜皆宜',
coreValue5Title: '多元文化',
coreValue5Desc: '國際視野',
```

---

## 實作步驟

### Phase 1：基礎架構（建議先完成）

1. 修改 `ParticleCanvas.tsx` 容器高度為 `500vh`
2. 建立 `src/particles/transforms/stage05-pulse.ts` 基礎架構
3. 更新 `src/particles/transforms/index.ts` 匯出
4. 調整所有現有 Overlay 的可見性範圍

### Phase 2：粒子效果

5. 實作 `stage05Transform` 脈衝波紋計算
6. 實作 `stage05SceneState` 場景狀態
7. 更新 `useStageComputation.ts` 過渡邏輯
8. 測試粒子過渡效果

### Phase 3：Overlay 組件

9. 建立 `src/components/stage05/` 資料夾結構
10. 實作 `CoreValueCard` 組件
11. 實作 `Stage05Overlay` 主組件
12. 新增 i18n 翻譯

### Phase 4：整合與優化

13. 整合到 `ParticleCanvas.tsx`
14. 響應式調整（手機版佈局）
15. 效能優化
16. 最終測試

---

## 測試清單

- [ ] Stage 0 → Stage 0.5 過渡流暢
- [ ] Stage 0.5 → Stage 1 過渡流暢
- [ ] 脈衝波紋效果正確
- [ ] 五個核心優勢卡片正確顯示
- [ ] 卡片進場動畫正確
- [ ] i18n 切換正常
- [ ] 手機版佈局正確
- [ ] 後續 Stage 的可見性時機正確
- [ ] 滾動 Snap 正確對齊

---

## 技術備註

### 效能考量

- 脈衝計算使用 `for` 迴圈而非 `Array.map`，避免每幀創建陣列
- 考慮使用 Web Worker 進行脈衝計算（如效能不佳）
- 手機版可減少波紋數量（3 → 2）

### 設計彈性

- 卡片位置可透過 CSS Grid 調整，便於後續調整
- 脈衝參數已抽離為配置物件，便於微調
- 顏色配置使用 HSL，便於主題擴展

---

## 參考資料

- [Stage 0 Circle Transform](../src/particles/transforms/stage0-circle.ts)
- [Stage 1 Bloom Transform](../src/particles/transforms/stage1-bloom.ts)
- [Particle Architecture](./PARTICLE_ARCHITECTURE.md)
