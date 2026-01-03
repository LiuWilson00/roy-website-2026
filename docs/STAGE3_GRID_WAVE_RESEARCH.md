# Stage 3: Grid Wave - 方陣波浪效果研究

## 需求概述

將 80 顆粒子排列成 5×16 的方形網格，呈現整齊的矩陣視覺。粒子顏色為白色，並有週期性由上而下傳遞的波浪效果，被波浪激發的方格會縮小。

### 視覺示意

波浪從中心向外擴散（漣漪效果）：

```
時間 t=0:              時間 t=1:              時間 t=2:
■ ■ ■ ■ ■             ■ ■ ■ ■ ■             · · · · ·
■ ■ ■ ■ ■             ■ ■ ■ ■ ■             · ■ ■ ■ ·
■ ■ · ■ ■      →      ■ · · · ■      →      · ■ ■ ■ ·
■ ■ ■ ■ ■             ■ ■ ■ ■ ■             · ■ ■ ■ ·
■ ■ ■ ■ ■             ■ ■ ■ ■ ■             · · · · ·
   中心激發              向外擴散               繼續擴散
```

· = 被波浪激發而縮小的方塊
■ = 正常大小的方塊
```

---

## 技術分析

### 1. 網格排列

將粒子 ID (0-79) 映射到 5×16 網格座標：

```typescript
const GRID_CONFIG = {
  cols: 5,        // 列數
  rows: 16,       // 行數
  cellSize: 30,   // 單元格大小
  gap: 8,         // 間距
}

function getGridPosition(particleId: number): { row: number; col: number } {
  return {
    row: Math.floor(particleId / GRID_CONFIG.cols),  // 0-15
    col: particleId % GRID_CONFIG.cols,              // 0-4
  }
}

function gridToScreen(row: number, col: number, center: Point): Point {
  const totalWidth = GRID_CONFIG.cols * (GRID_CONFIG.cellSize + GRID_CONFIG.gap) - GRID_CONFIG.gap
  const totalHeight = GRID_CONFIG.rows * (GRID_CONFIG.cellSize + GRID_CONFIG.gap) - GRID_CONFIG.gap

  return {
    x: center.x - totalWidth / 2 + col * (GRID_CONFIG.cellSize + GRID_CONFIG.gap) + GRID_CONFIG.cellSize / 2,
    y: center.y - totalHeight / 2 + row * (GRID_CONFIG.cellSize + GRID_CONFIG.gap) + GRID_CONFIG.cellSize / 2,
  }
}
```

**複雜度**: 極低，純數學計算

### 2. 波浪效果（從中心向外擴散）

週期性從網格中心向外擴散的漣漪波浪：

```typescript
const WAVE_CONFIG = {
  speed: 80,            // 波浪擴散速度（像素/秒）
  width: 2,             // 波浪寬度（影響範圍）
  shrinkAmount: 0.7,    // 收縮比例（1 = 完全收縮，0 = 不收縮）
  period: 3,            // 波浪週期（秒），新波浪間隔
  maxRadius: 300,       // 最大擴散半徑
}

function calculateRadialWaveEffect(
  row: number,
  col: number,
  time: number,
  gridCenter: { row: number; col: number }
): number {
  const { speed, width, period, maxRadius } = WAVE_CONFIG
  const { cellSize, gap } = GRID_CONFIG

  // 計算方塊與網格中心的距離（像素）
  const dx = (col - gridCenter.col) * (cellSize + gap)
  const dy = (row - gridCenter.row) * (cellSize + gap)
  const distanceFromCenter = Math.sqrt(dx * dx + dy * dy)

  // 計算當前波浪半徑（週期性擴散）
  const waveRadius = ((time % period) / period) * maxRadius

  // 計算方塊與波浪圓環的距離
  const distanceToWave = Math.abs(distanceFromCenter - waveRadius)

  // 波浪寬度內則受影響
  const waveWidthPx = width * (cellSize + gap)
  if (distanceToWave < waveWidthPx) {
    // 使用 cosine 讓效果平滑，波峰在中心
    const intensity = Math.cos((distanceToWave / waveWidthPx) * Math.PI * 0.5)
    return intensity  // 0-1，表示受影響程度
  }

  return 0
}
```

**波浪行為**:
- 從網格中心開始
- 像水波一樣向外擴散成圓環
- 擴散到最大半徑後，新波浪從中心再次產生
- 被波浪經過的方塊會縮小

**複雜度**: 低，距離計算 + 三角函數

### 3. 粒子縮放

根據波浪強度調整粒子大小：

```typescript
function getParticleSize(baseSize: number, waveIntensity: number): number {
  const { shrinkAmount } = WAVE_CONFIG
  // 波浪越強，縮小越多
  return baseSize * (1 - waveIntensity * shrinkAmount)
}
```

### 4. 完整 Transform 函數

```typescript
export function stage3Transform(
  particle: Particle,
  context: TransformContext
): ParticleState {
  const { time, center } = context

  // 計算網格位置
  const { row, col } = getGridPosition(particle.id)
  const screenPos = gridToScreen(row, col, center)

  // 網格中心（5×16 的中心點）
  const gridCenter = {
    row: (GRID_CONFIG.rows - 1) / 2,  // 7.5
    col: (GRID_CONFIG.cols - 1) / 2,  // 2
  }

  // 計算從中心向外擴散的波浪效果
  const waveIntensity = calculateRadialWaveEffect(row, col, time, gridCenter)

  // 基礎大小與縮放
  const baseSize = GRID_CONFIG.cellSize * 0.4  // 方格大小
  const currentSize = getParticleSize(baseSize, waveIntensity)

  return {
    x: screenPos.x,
    y: screenPos.y,
    r: currentSize,
    opacity: 1,
    glow: 3 + waveIntensity * 10,  // 波浪時發光增強
    color: 'white',
    trailLength: 0,  // 無拖尾
  }
}
```

---

## 視覺增強選項

### A. 多重同心波浪
同時有多個波浪從中心向外擴散：

```typescript
function calculateMultiRadialWave(row: number, col: number, time: number, gridCenter): number {
  const waveCount = 2  // 同時 2 個波浪
  let maxIntensity = 0

  for (let i = 0; i < waveCount; i++) {
    const offset = i * (WAVE_CONFIG.period / waveCount)
    const intensity = calculateRadialWaveEffect(row, col, time + offset, gridCenter)
    maxIntensity = Math.max(maxIntensity, intensity)
  }

  return maxIntensity
}
```

### B. 波浪顏色脈衝
波浪經過時，方格暫時發出顏色：

```typescript
const color = waveIntensity > 0.1
  ? `hsl(200, ${waveIntensity * 100}%, ${70 + waveIntensity * 20}%)`  // 青色脈衝
  : 'white'
```

### C. 波浪時微微抬起
被激發的方塊稍微向上移動，增加立體感：

```typescript
const liftAmount = waveIntensity * -8  // 向上偏移
screenPos.y += liftAmount
```

### D. 波浪餘波效果
波浪經過後方塊慢慢恢復，產生餘波：

```typescript
// 追蹤每個方塊最後被激發的時間
// 在激發後的一段時間內慢慢恢復原本大小
const recoveryTime = 0.5  // 恢復時間
const timeSinceActivation = time - lastActivationTime[particle.id]
const recoveryFactor = Math.min(1, timeSinceActivation / recoveryTime)
const finalSize = lerp(shrunkSize, baseSize, easeOutElastic(recoveryFactor))
```

---

## 過渡效果

### Stage 2 → Stage 3 過渡

從行星軌道過渡到方格排列：

1. **位置插值**: 粒子從軌道位置平滑移動到網格位置
2. **大小插值**: 從深度相關大小變為統一大小
3. **顏色插值**: 從循環色彩變為白色
4. **光核淡出**: Stage 2 的太陽光核逐漸消失

現有的 `interpolateState` 函數可以自動處理位置、大小、透明度的過渡。

### 場景狀態

```typescript
export function stage3SceneState(context: TransformContext): SceneState {
  return {
    core: {
      ...DEFAULT_CORE_STATE,
      visible: false,  // Stage 3 沒有中心光核
      opacity: 0,
    }
  }
}
```

---

## 效能分析

### 計算量

每幀每粒子：
- 網格位置計算: 2 次除法/取餘
- 波浪效果計算: 1 次取餘, 1 次絕對值, 1 次 cos
- 大小計算: 2 次乘法

**總計**: ~10 次基本運算/粒子/幀 = 800 次/幀

**結論**: 效能影響可忽略

### 記憶體

無額外記憶體需求

---

## 可行性評估

| 項目 | 評估 | 說明 |
|-----|------|-----|
| 技術複雜度 | **極低** | 純數學，無複雜演算法 |
| 效能影響 | **可忽略** | 計算量極小 |
| 架構適配 | **完美** | 直接使用現有 transform 系統 |
| 過渡效果 | **自動** | 現有插值系統支援 |
| 視覺效果 | **清晰** | 幾何排列 + 波浪動畫 |

---

## 結論

**可行性: 極高** ✅

Stage 3 的方陣波浪效果非常適合現有架構，實作難度極低。主要工作：

1. 建立網格座標映射
2. 實作波浪函數
3. 組合成 transform 函數

### 預估實作時間

- 基礎功能: ~20 分鐘
- 視覺增強: ~15 分鐘
- 測試調整: ~10 分鐘

**總計: ~45 分鐘**

---

## 建議實作順序

1. **基礎版本**: 5×16 網格 + 單波浪 + 縮小效果
2. **調整參數**: 波浪速度、寬度、縮小比例
3. **視覺增強**: 根據效果選擇加入 A/B/C/D 選項
4. **過渡測試**: 確認 Stage 2→3 平滑過渡

---

## 參考

- 現有 transform 架構: `src/particles/transforms/`
- 插值系統: `src/particles/interpolation.ts`
- 數學工具: `src/utils/math.ts`
