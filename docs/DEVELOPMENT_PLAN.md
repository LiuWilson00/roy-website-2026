# Project: Cyber Iris (Personal Website)

## 1. 專案概述 (Overview)
本專案旨在打造一個「程式碼驅動」的個人網站。核心視覺是一個名為 **"Cyber Iris" (數位虹膜)** 的互動元件。
該元件並非播放影片，而是由 **SVG + GSAP** 即時渲染。隨著使用者的滾動，視覺將經歷從「有機生物感」到「結構化數據」的演變，象徵著從靈感到實作的工程過程。

### 核心體驗流程
1.  **Stage 0: The Origin (動機)** - 一個呼吸著的、有機的圓環 (Polar Coordinates)。
2.  **Stage 1: The Bloom (分析)** - 隨著滾動，圓環分層、旋轉，展現幾何美感。
3.  **Stage 2: The Matrix (實作)** - 粒子吸附至網格，變為整齊的程式碼/數據矩陣 (Cartesian Coordinates)。

---

## 2. 技術棧 (Tech Stack)
* **Build Tool:** Vite
* **Framework:** React 18+
* **Animation:** GSAP (GreenSock Animation Platform) + ScrollTrigger
* **Rendering:** React + Native SVG (DOM elements)
* **Styling:** CSS Modules or Tailwind CSS

---

## 3. 開發步驟 (Development Steps)

### Step 1: 專案初始化 (Project Setup)
在終端機執行以下指令建立環境：

```bash
# 1. 建立 Vite + React 專案 (使用 TypeScript)
npm create vite@latest my-portfolio -- --template react-ts

# 2. 進入資料夾
cd my-portfolio

# 3. 安裝依賴
npm install

# 4. 安裝動畫依賴
npm install gsap @gsap/react

# 5. (選用) 安裝 Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Step 2: 數學模型定義 (Math Logic)
在開發組件前，我們需要先定義粒子的座標邏輯。總粒子數 (N): 80 ~ 100 個
狀態 A (極座標/圓環):
$$x = center_x + \cos(\theta) \times radius$$y = center_y + \sin(\theta) \times radius$$
狀態 B (笛卡爾座標/矩陣):
$$col = i \% cols$$row = \text{floor}(i / cols)$$x = start_x + col \times spacing$$y = start_y + row \times spacing$$

### Step 3: 核心組件開發 (CyberIris.tsx)
請在 `src/components/` 建立 `CyberIris.tsx`。
```tsx
import { useRef, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// 註冊 GSAP 插件
gsap.registerPlugin(ScrollTrigger);

export default function CyberIris() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  // --- Config ---
  const COUNT = 100;         // 粒子數量 (建議 10x10)
  const RADIUS = 180;        // 圓環半徑
  const CENTER = { x: 400, y: 300 }; // SVG 畫布中心 (基於 viewBox 800x600)
  const GRID_COLS = 10;      // 矩陣列數
  const GRID_SPACING = 40;   // 矩陣間距

  // --- Data Generation ---
  // 預先計算每個點的「起點(圓)」與「終點(方)」
  const dots = useMemo(() => {
    // 計算矩陣起始點 (讓矩陣居中)
    const gridWidth = (GRID_COLS - 1) * GRID_SPACING;
    const gridHeight = (Math.ceil(COUNT / GRID_COLS) - 1) * GRID_SPACING;
    const startX = CENTER.x - gridWidth / 2;
    const startY = CENTER.y - gridHeight / 2;

    return Array.from({ length: COUNT }).map((_, i) => {
      // 1. 極座標 (Polar)
      const angle = (i / COUNT) * Math.PI * 2;
      const polarX = CENTER.x + Math.cos(angle) * RADIUS;
      const polarY = CENTER.y + Math.sin(angle) * RADIUS;

      // 2. 笛卡爾座標 (Grid)
      const col = i % GRID_COLS;
      const row = Math.floor(i / GRID_COLS);
      const gridX = startX + col * GRID_SPACING;
      const gridY = startY + row * GRID_SPACING;

      return { id: i, polarX, polarY, gridX, gridY, angle };
    });
  }, []);

  // --- Animation Logic ---
  useGSAP(() => {
    if (!containerRef.current) return;
    const dotsElements = gsap.utils.toArray('.iris-dot');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: '+=3000', // 滾動距離 (決定動畫速度)
        scrub: 1,      // 平滑係數
        pin: true,     // 釘住畫面
        anticipatePin: 1,
      }
    });

    // Phase 1: Bloom (幾何分層)
    tl.to(dotsElements, {
      cx: (i) => {
        const r = i % 2 === 0 ? RADIUS * 1.5 : RADIUS * 0.5;
        return CENTER.x + Math.cos(dots[i].angle) * r;
      },
      cy: (i) => {
        const r = i % 2 === 0 ? RADIUS * 1.5 : RADIUS * 0.5;
        return CENTER.y + Math.sin(dots[i].angle) * r;
      },
      r: (i) => i % 2 === 0 ? 6 : 3, // 大小變化
      fill: (i) => i % 2 === 0 ? '#00ffff' : '#ff0055', // Cyan & Magenta
      opacity: 0.8,
      duration: 5,
      ease: 'power2.inOut'
    })

    // Phase 2: Spin (旋轉動能)
    .to(dotsElements, {
      rotation: 360,
      transformOrigin: 'center', // 自轉 (若要公轉需用 Group 或重算座標)
      fill: '#ffffff',
      duration: 2,
    }, "<")

    // Phase 3: Matrix Lock (歸位)
    .to(dotsElements, {
      cx: (i) => dots[i].gridX,
      cy: (i) => dots[i].gridY,
      r: 12,          // 變大準備變成方塊
      fill: '#111',   // 變空心感 (深色填充)
      stroke: '#0f0', // 綠色邊框
      strokeWidth: 2,
      rotation: 0,    // 轉正
      duration: 5,
      ease: 'power4.out'
    })

    // Phase 4: Datafication (數據化)
    .to(dotsElements, {
      scale: 0.6,     // 縮小
      strokeWidth: 0, // 去邊框
      fill: '#0f0',   // 實心綠
      opacity: (i) => Math.random() > 0.5 ? 1 : 0.3, // 隨機閃爍
      stagger: {
        amount: 1,
        from: "center",
        grid: [GRID_COLS, GRID_COLS]
      },
      duration: 3
    });

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-black overflow-hidden">
      {/* 標題層：永遠浮在最上面 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none mix-blend-difference">
        <h1 className="text-white font-mono text-4xl tracking-widest">SYSTEM CORE</h1>
      </div>

      {/* SVG 層 */}
      <svg
        ref={svgRef}
        viewBox="0 0 800 600"
        className="w-full h-full max-w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* 背景裝飾圈 */}
        <circle cx={CENTER.x} cy={CENTER.y} r={RADIUS} fill="none" stroke="#333" strokeWidth="1" />

        {/* 粒子渲染 */}
        {dots.map((dot) => (
          <circle
            key={dot.id}
            className="iris-dot"
            cx={dot.polarX}
            cy={dot.polarY}
            r={3}
            fill="white"
          />
        ))}
      </svg>

      {/* 底部提示 */}
      <div className="absolute bottom-10 w-full text-center text-gray-500 font-mono text-sm">
        SCROLL TO ANALYZE
      </div>
    </div>
  );
}
```

4. 進階優化建議 (To-Do List)
RWD 響應式調整:

目前的 SVG viewBox="0 0 800 600" 在手機上可能會顯示不全。

建議：在手機版將 GRID_COLS 減少為 5 或 6，並動態調整 RADIUS。

視覺特效 (Glow Effect):

在 SVG 中加入 <filter> 元素製作發光效果。

或是簡單地用 CSS: .iris-dot { filter: drop-shadow(0 0 2px rgba(0, 255, 255, 0.8)); }

內容整合:

在矩陣化的最後階段，可以將特定的點替換成 <text> 標籤，顯示你的技術關鍵字（React, Next, Node）。

5. 常見問題排除
問題: 畫面沒有釘住 (Pin)？

解法: 檢查父層容器是否有 overflow: hidden 或 height: 100vh 限制了滾動。通常 ScrollTrigger 需要父層是可以自由滾動的。

問題: 動畫在熱更新後失效？

解法: 在開發模式下，Vite 的 HMR 可能造成 ScrollTrigger 實例累積。可在 `useGSAP` 的 cleanup 中加入 `ScrollTrigger.killAll()`。