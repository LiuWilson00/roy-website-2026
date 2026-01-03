/**
 * Math Utilities for Particle System
 */

// 線性插值
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

// Clamp 值到範圍
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// 兩點距離
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1
  const dy = y2 - y1
  return Math.sqrt(dx * dx + dy * dy)
}

// ============ Easing Functions ============

// Ease In Out Cubic
export function easeInOutCubic(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// Ease Out Cubic
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

// Ease In Out Sine
export function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2
}

// Ease Out Elastic
export function easeOutElastic(t: number): number {
  const c4 = (2 * Math.PI) / 3
  return t === 0
    ? 0
    : t === 1
    ? 1
    : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
}

// ============ Polar/Cartesian Conversion ============

// 極座標轉笛卡爾座標
export function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  theta: number
): { x: number; y: number } {
  return {
    x: centerX + Math.cos(theta) * radius,
    y: centerY + Math.sin(theta) * radius,
  }
}

// 笛卡爾座標轉極座標
export function cartesianToPolar(
  x: number,
  y: number,
  centerX: number,
  centerY: number
): { radius: number; theta: number } {
  const dx = x - centerX
  const dy = y - centerY
  return {
    radius: Math.sqrt(dx * dx + dy * dy),
    theta: Math.atan2(dy, dx),
  }
}

// ============ Angle Utilities ============

// 標準化角度到 [0, 2π)
export function normalizeAngle(angle: number): number {
  const TWO_PI = Math.PI * 2
  return ((angle % TWO_PI) + TWO_PI) % TWO_PI
}

// 角度插值（處理環繞）
export function lerpAngle(a: number, b: number, t: number): number {
  const TWO_PI = Math.PI * 2
  let diff = ((b - a + Math.PI) % TWO_PI) - Math.PI
  if (diff < -Math.PI) diff += TWO_PI
  return a + diff * t
}

// ============ Color Utilities ============

// 解析 HSL 字串 "hsl(h, s%, l%)" 為 {h, s, l}
export function parseHSL(hslString: string): { h: number; s: number; l: number } | null {
  const match = hslString.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
  if (!match) return null
  return {
    h: parseInt(match[1], 10),
    s: parseInt(match[2], 10),
    l: parseInt(match[3], 10),
  }
}

// HSL 轉字串
export function hslToString(h: number, s: number, l: number): string {
  return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`
}

// 在兩個 HSL 顏色之間插值
export function lerpHSL(
  from: { h: number; s: number; l: number },
  to: { h: number; s: number; l: number },
  t: number
): string {
  // 色相需要特殊處理（環繞）
  let hDiff = to.h - from.h
  if (hDiff > 180) hDiff -= 360
  if (hDiff < -180) hDiff += 360

  const h = (from.h + hDiff * t + 360) % 360
  const s = lerp(from.s, to.s, t)
  const l = lerp(from.l, to.l, t)

  return hslToString(h, s, l)
}

// 從白色插值到目標 HSL 顏色
export function lerpFromWhite(targetHSL: string, t: number): string {
  const target = parseHSL(targetHSL)
  if (!target) return 'white'

  // 白色 = hsl(0, 0%, 100%)
  const white = { h: target.h, s: 0, l: 100 }

  return lerpHSL(white, target, t)
}
