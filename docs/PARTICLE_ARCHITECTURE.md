# Particle System Architecture

## Core Philosophy

整個視覺系統以「粒子變換」為核心。所有動畫階段本質上都是對同一組粒子進行不同的座標變換，而非創建不同的視覺元素。

```
粒子 (Particle) = 極座標 (θ, baseRadius) → 變換函數 f(t, mouse, scroll) → 螢幕座標 (x, y)
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        ParticleCanvas                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Particle System                         │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐      ┌─────────┐  │  │
│  │  │ Dot 0   │  │ Dot 1   │  │ Dot 2   │ ...  │ Dot N   │  │  │
│  │  │ θ = 0°  │  │ θ = 4.5°│  │ θ = 9°  │      │ θ = 360°│  │  │
│  │  └────┬────┘  └────┬────┘  └────┬────┘      └────┬────┘  │  │
│  │       │            │            │                 │       │  │
│  │       └────────────┴────────────┴─────────────────┘       │  │
│  │                          │                                 │  │
│  │                          ▼                                 │  │
│  │              ┌─────────────────────┐                      │  │
│  │              │  Stage Transformer  │                      │  │
│  │              │  ─────────────────  │                      │  │
│  │              │  inputs:            │                      │  │
│  │              │  - θ (polar angle)  │                      │  │
│  │              │  - t (time)         │                      │  │
│  │              │  - mouse (x, y)     │                      │  │
│  │              │  - scroll progress  │                      │  │
│  │              │                     │                      │  │
│  │              │  output:            │                      │  │
│  │              │  - x, y (screen)    │                      │  │
│  │              │  - radius           │                      │  │
│  │              │  - opacity          │                      │  │
│  │              │  - glow intensity   │                      │  │
│  │              └─────────────────────┘                      │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Core Data Structures

### Particle

每個粒子的基礎資料：

```typescript
interface Particle {
  id: number
  theta: number        // 極座標角度 [0, 2π)
  baseRadius: number   // 基礎半徑（可用於分層）
}
```

### ParticleState

粒子在特定時刻的渲染狀態：

```typescript
interface ParticleState {
  x: number           // 螢幕 X 座標
  y: number           // 螢幕 Y 座標
  r: number           // 點的大小
  opacity: number     // 透明度 [0, 1]
  glow: number        // 光暈強度
}
```

### TransformContext

變換函數的輸入上下文：

```typescript
interface TransformContext {
  time: number              // 動畫時間
  mouse: { x: number, y: number }  // 滑鼠位置
  center: { x: number, y: number } // 畫布中心
  scrollProgress: number    // 滾動進度 [0, 1] 用於 stage 過渡
}
```

## Stage Transform Functions

每個 Stage 定義一個變換函數，將粒子的極座標轉換為螢幕座標：

```typescript
type StageTransform = (
  particle: Particle,
  context: TransformContext
) => ParticleState
```

### Stage 0: The Circle (呼吸圓環)

```typescript
const stage0Transform: StageTransform = (particle, ctx) => {
  const { theta } = particle
  const { time, mouse, center } = ctx

  // 1. 呼吸效果：半徑隨時間週期變化
  const breathRadius = BASE_RADIUS * (1 + 0.12 * Math.sin(time * 0.5))

  // 2. 滑鼠互動：基於距離的振幅調變
  const hoverOffset = calculateHoverOffset(theta, time, mouse, center)

  // 3. 最終座標
  const finalRadius = breathRadius + hoverOffset
  return {
    x: center.x + Math.cos(theta) * finalRadius,
    y: center.y + Math.sin(theta) * finalRadius,
    r: 3,
    opacity: 1,
    glow: 4 + 4 * Math.sin(time * 0.5)  // 光暈同步呼吸
  }
}
```

### Stage 1: The Bloom (綻放)

```typescript
const stage1Transform: StageTransform = (particle, ctx) => {
  const { theta, baseRadius } = particle
  const { time, center } = ctx

  // 分層旋轉：不同半徑的粒子有不同旋轉速度
  const layerRotation = time * 0.3 * (1 + baseRadius * 0.5)
  const rotatedTheta = theta + layerRotation

  // 花瓣形狀：半徑隨角度變化
  const petalCount = 5
  const petalRadius = BASE_RADIUS * (1 + 0.3 * Math.sin(petalCount * rotatedTheta))

  return {
    x: center.x + Math.cos(rotatedTheta) * petalRadius,
    y: center.y + Math.sin(rotatedTheta) * petalRadius,
    r: 3,
    opacity: 1,
    glow: 6
  }
}
```

### Stage 2: The Matrix (矩陣)

```typescript
const stage2Transform: StageTransform = (particle, ctx) => {
  const { theta } = particle
  const { center } = ctx

  // 極座標映射到網格
  const gridSize = 20
  const col = Math.floor((theta / (2 * Math.PI)) * gridSize)
  const row = particle.id % gridSize

  return {
    x: center.x + (col - gridSize/2) * 25,
    y: center.y + (row - gridSize/2) * 25,
    r: 4,
    opacity: 1,
    glow: 2
  }
}
```

## Stage Transition: Interpolation

滾動時，透過線性插值在兩個 Stage 之間平滑過渡：

```typescript
function interpolateStages(
  particle: Particle,
  context: TransformContext,
  fromStage: StageTransform,
  toStage: StageTransform,
  progress: number  // [0, 1]
): ParticleState {
  const fromState = fromStage(particle, context)
  const toState = toStage(particle, context)

  // 使用 easing 讓過渡更自然
  const t = easeInOutCubic(progress)

  return {
    x: lerp(fromState.x, toState.x, t),
    y: lerp(fromState.y, toState.y, t),
    r: lerp(fromState.r, toState.r, t),
    opacity: lerp(fromState.opacity, toState.opacity, t),
    glow: lerp(fromState.glow, toState.glow, t),
  }
}
```

## Scroll-Based Stage Management

```typescript
interface StageConfig {
  id: number
  transform: StageTransform
  scrollStart: number   // 開始滾動位置 (vh)
  scrollEnd: number     // 結束滾動位置 (vh)
}

const stages: StageConfig[] = [
  { id: 0, transform: stage0Transform, scrollStart: 0, scrollEnd: 100 },
  { id: 1, transform: stage1Transform, scrollStart: 100, scrollEnd: 200 },
  { id: 2, transform: stage2Transform, scrollStart: 200, scrollEnd: 300 },
]

function getCurrentTransform(scrollY: number): StageTransform {
  // 找到當前所在的 stage 區間
  // 如果在過渡區，返回 interpolated transform
  // ...
}
```

## File Structure

```
src/
├── components/
│   └── ParticleCanvas.tsx      # 主渲染組件
├── particles/
│   ├── types.ts                # 型別定義
│   ├── Particle.ts             # 粒子類別
│   ├── transforms/
│   │   ├── index.ts            # 匯出所有 transforms
│   │   ├── stage0-circle.ts    # Stage 0 變換
│   │   ├── stage1-bloom.ts     # Stage 1 變換
│   │   └── stage2-matrix.ts    # Stage 2 變換
│   ├── interpolation.ts        # 插值與過渡邏輯
│   └── interactions.ts         # 滑鼠/點擊互動計算
├── hooks/
│   ├── useParticleSystem.ts    # 粒子系統 hook
│   ├── useScrollProgress.ts    # 滾動進度 hook
│   └── useMousePosition.ts     # 滑鼠位置 hook
└── utils/
    └── math.ts                 # lerp, easing functions
```

## Rendering Pipeline

每一幀的渲染流程：

```
1. 讀取輸入
   ├── time (GSAP ticker)
   ├── mouse position
   └── scroll position

2. 計算當前 stage 與過渡進度
   └── scrollProgress → (currentStage, nextStage, transitionProgress)

3. 對每個粒子計算 ParticleState
   └── particle.forEach(p => transform(p, context))

4. 批次更新 DOM/SVG
   └── 更新所有 circle 元素的 cx, cy, r, opacity
```

## Benefits of This Architecture

1. **可擴展性**：新增 Stage 只需新增一個 transform 函數
2. **平滑過渡**：Stage 之間透過數學插值自然銜接
3. **統一互動**：滑鼠/點擊互動可以套用到所有 Stage
4. **效能優化**：所有粒子共用相同的計算邏輯，便於優化
5. **易於調試**：每個 Stage 獨立，可單獨測試

## Next Steps

1. [ ] 重構 CyberIris.tsx，抽離 transform 函數
2. [ ] 建立 particles/ 目錄結構
3. [ ] 實作 Stage 1 transform
4. [ ] 加入 ScrollTrigger 進行 stage 切換
5. [ ] 實作 interpolation 過渡效果
