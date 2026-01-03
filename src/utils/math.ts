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
