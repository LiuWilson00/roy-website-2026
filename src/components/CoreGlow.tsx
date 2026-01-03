/**
 * CoreGlow - 中心光核組件
 * 渲染太陽般的中心光源，帶有漸層光線
 */

import type { CoreGlowState, Point } from '../particles/types'
import { INTERACTION_CONFIG } from '../particles/interactions'

interface CoreGlowProps {
  state: CoreGlowState
  center: Point
  time: number
  interactionIntensity?: number  // 0-1，滑鼠靠近光核的強度
}

export default function CoreGlow({ state, center, time, interactionIntensity = 0 }: CoreGlowProps) {
  if (!state.visible || state.opacity <= 0) {
    return null
  }

  const { coreInteraction } = INTERACTION_CONFIG

  // 根據互動強度調整參數
  const boostedPulseSpeed = state.pulseSpeed * (1 + interactionIntensity * (coreInteraction.pulseBoost - 1))
  const boostedRayLength = state.rayLength * (1 + interactionIntensity * (coreInteraction.rayLengthBoost - 1))
  const boostedGlow = state.coreGlow * (1 + interactionIntensity * (coreInteraction.glowBoost - 1))

  // 計算脈動效果（更平滑的 sine 波）
  const pulse = 1 + Math.sin(time * boostedPulseSpeed * Math.PI * 2) * state.pulseAmplitude
  const currentCoreRadius = state.coreRadius * pulse
  const currentRayLength = boostedRayLength * pulse

  // 計算旋轉角度（轉換為度數）
  const rotation = time * state.rotationSpeed * 360

  // 解析光線顏色的 HSL 值用於漸層
  const rayColorMatch = state.rayColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
  const rayH = rayColorMatch ? rayColorMatch[1] : '200'
  const rayS = rayColorMatch ? rayColorMatch[2] : '100'
  const rayL = rayColorMatch ? rayColorMatch[3] : '80'

  // 儲存所有光線資料（用於生成對應的漸層）
  interface RayData {
    id: string
    x1: number
    y1: number
    x2: number
    y2: number
    strokeWidth: number
    opacity: number
    type: 'primary' | 'secondary' | 'tertiary'
  }

  const allRays: RayData[] = []

  // 生成主光線資料
  for (let i = 0; i < state.rayCount; i++) {
    const angle = (i / state.rayCount) * Math.PI * 2
    const startR = currentCoreRadius + 3
    const endR = currentCoreRadius + currentRayLength

    const x1 = Math.cos(angle) * startR
    const y1 = Math.sin(angle) * startR
    const x2 = Math.cos(angle) * endR
    const y2 = Math.sin(angle) * endR

    const individualPulse = 0.85 + Math.sin(time * 0.3 + i * 0.3) * 0.15

    allRays.push({
      id: `ray-${i}`,
      x1, y1, x2, y2,
      strokeWidth: state.rayWidth * individualPulse,
      opacity: individualPulse,
      type: 'primary'
    })
  }

  // 生成次級光線資料
  for (let i = 0; i < state.rayCount; i++) {
    const angle = ((i + 0.5) / state.rayCount) * Math.PI * 2
    const startR = currentCoreRadius + 5
    const endR = currentCoreRadius + currentRayLength * 0.6

    const x1 = Math.cos(angle) * startR
    const y1 = Math.sin(angle) * startR
    const x2 = Math.cos(angle) * endR
    const y2 = Math.sin(angle) * endR

    const individualPulse = 0.7 + Math.sin(time * 0.25 + i * 0.4) * 0.3

    allRays.push({
      id: `ray-secondary-${i}`,
      x1, y1, x2, y2,
      strokeWidth: state.rayWidth * 0.5 * individualPulse,
      opacity: individualPulse * 0.6,
      type: 'secondary'
    })
  }

  // 生成第三層光線資料
  for (let i = 0; i < state.rayCount * 2; i++) {
    const angle = ((i + 0.25) / (state.rayCount * 2)) * Math.PI * 2
    const startR = currentCoreRadius + 2
    const endR = currentCoreRadius + currentRayLength * 0.35

    const x1 = Math.cos(angle) * startR
    const y1 = Math.sin(angle) * startR
    const x2 = Math.cos(angle) * endR
    const y2 = Math.sin(angle) * endR

    const individualPulse = 0.5 + Math.sin(time * 0.2 + i * 0.2) * 0.5

    allRays.push({
      id: `ray-tertiary-${i}`,
      x1, y1, x2, y2,
      strokeWidth: state.rayWidth * 0.25,
      opacity: individualPulse * 0.4,
      type: 'tertiary'
    })
  }

  // 根據類型取得透明度配置
  const getOpacityStops = (type: 'primary' | 'secondary' | 'tertiary') => {
    switch (type) {
      case 'primary':
        return [
          { offset: '0%', opacity: 0.9 },
          { offset: '30%', opacity: 0.6 },
          { offset: '70%', opacity: 0.2 },
          { offset: '100%', opacity: 0 },
        ]
      case 'secondary':
        return [
          { offset: '0%', opacity: 0.7 },
          { offset: '50%', opacity: 0.3 },
          { offset: '100%', opacity: 0 },
        ]
      case 'tertiary':
        return [
          { offset: '0%', opacity: 0.5 },
          { offset: '60%', opacity: 0.15 },
          { offset: '100%', opacity: 0 },
        ]
    }
  }

  // 分離不同類型的光線
  const primaryRays = allRays.filter(r => r.type === 'primary')
  const secondaryRays = allRays.filter(r => r.type === 'secondary')
  const tertiaryRays = allRays.filter(r => r.type === 'tertiary')

  return (
    <g
      transform={`translate(${center.x}, ${center.y}) rotate(${rotation})`}
      opacity={state.opacity}
    >
      <defs>
        {/* 為每條光線創建獨立的漸層，使用 userSpaceOnUse 確保方向正確 */}
        {allRays.map(ray => {
          const stops = getOpacityStops(ray.type)
          return (
            <linearGradient
              key={`gradient-${ray.id}`}
              id={`gradient-${ray.id}`}
              x1={ray.x1}
              y1={ray.y1}
              x2={ray.x2}
              y2={ray.y2}
              gradientUnits="userSpaceOnUse"
            >
              {stops.map((stop, idx) => (
                <stop
                  key={idx}
                  offset={stop.offset}
                  stopColor={`hsl(${rayH}, ${rayS}%, ${rayL}%)`}
                  stopOpacity={stop.opacity}
                />
              ))}
            </linearGradient>
          )
        })}

        {/* 核心光暈濾鏡 */}
        <filter id="core-glow-filter" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={boostedGlow * 0.8} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* 柔和光暈濾鏡 */}
        <filter id="soft-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
        </filter>

        {/* 核心漸層 */}
        <radialGradient id="core-gradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="50%" stopColor={state.coreColor} stopOpacity="0.8" />
          <stop offset="100%" stopColor={state.coreColor} stopOpacity="0" />
        </radialGradient>

        {/* 外層光暈漸層 */}
        <radialGradient id="outer-glow-gradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={state.coreColor} stopOpacity="0.3" />
          <stop offset="60%" stopColor={state.coreColor} stopOpacity="0.1" />
          <stop offset="100%" stopColor={state.coreColor} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 最外層柔和光暈 */}
      <circle
        cx={0}
        cy={0}
        r={currentCoreRadius * 4}
        fill="url(#outer-glow-gradient)"
        opacity={0.5}
      />

      {/* 第三層光線（最細） */}
      <g filter="url(#soft-glow)">
        {tertiaryRays.map(ray => (
          <line
            key={ray.id}
            x1={ray.x1}
            y1={ray.y1}
            x2={ray.x2}
            y2={ray.y2}
            stroke={`url(#gradient-${ray.id})`}
            strokeWidth={ray.strokeWidth}
            strokeLinecap="round"
            opacity={ray.opacity}
          />
        ))}
      </g>

      {/* 次級光線 */}
      <g filter="url(#soft-glow)">
        {secondaryRays.map(ray => (
          <line
            key={ray.id}
            x1={ray.x1}
            y1={ray.y1}
            x2={ray.x2}
            y2={ray.y2}
            stroke={`url(#gradient-${ray.id})`}
            strokeWidth={ray.strokeWidth}
            strokeLinecap="round"
            opacity={ray.opacity}
          />
        ))}
      </g>

      {/* 主光線 */}
      <g>
        {primaryRays.map(ray => (
          <line
            key={ray.id}
            x1={ray.x1}
            y1={ray.y1}
            x2={ray.x2}
            y2={ray.y2}
            stroke={`url(#gradient-${ray.id})`}
            strokeWidth={ray.strokeWidth}
            strokeLinecap="round"
            opacity={ray.opacity}
          />
        ))}
      </g>

      {/* 中層光暈 */}
      <circle
        cx={0}
        cy={0}
        r={currentCoreRadius * 2}
        fill="url(#core-gradient)"
        opacity={0.6}
      />

      {/* 核心 */}
      <circle
        cx={0}
        cy={0}
        r={currentCoreRadius}
        fill="white"
        opacity={0.85}
        filter="url(#core-glow-filter)"
      />

      {/* 核心高光 */}
      <circle
        cx={0}
        cy={0}
        r={currentCoreRadius * 0.5}
        fill="white"
        opacity={0.95}
      />
    </g>
  )
}
