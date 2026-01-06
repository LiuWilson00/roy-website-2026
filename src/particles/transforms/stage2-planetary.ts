/**
 * Stage 2: Planetary Motion (行星運動)
 * 粒子模擬行星繞日運動，具有 3D 透視效果
 * 光核為太陽，粒子在傾斜軌道上公轉
 */

import type { Particle, ParticleState, TransformContext, SceneState, CoreGlowState } from '../types'
import { DEFAULT_CORE_STATE } from '../types'
import { lerp } from '../../utils/math'
import {
  getParticleOrbitCache,
  getPooledPoint3D,
  getPooledProjection,
  getPooledDepth,
  type CachedOrbitInfo
} from '../../utils/cache'

// Stage 2 配置
export const STAGE2_CONFIG = {
  // 透視設定
  focalLength: 500,                    // 焦距（降低以增強透視效果）
  baseTiltAngle: 15 * Math.PI / 180,   // 基礎傾斜角度

  // 軌道配置（分配 80 顆粒子到 10 個軌道，每個軌道有不同傾斜）
  orbits: [
    // 內層軌道群 - 較快，較陡傾斜
    { radius: 55,  count: 5,  speed: 0.15,  direction: 1,  tilt: 25 },   // 25度傾斜
    { radius: 75,  count: 6,  speed: 0.12,  direction: -1, tilt: 8 },    // 8度傾斜
    { radius: 95,  count: 8,  speed: 0.10,  direction: 1,  tilt: 18 },   // 18度傾斜

    // 中層軌道群 - 中等速度
    { radius: 120, count: 10, speed: 0.08,  direction: -1, tilt: 12 },   // 12度傾斜
    { radius: 145, count: 10, speed: 0.07,  direction: 1,  tilt: 22 },   // 22度傾斜
    { radius: 170, count: 12, speed: 0.06,  direction: -1, tilt: 5 },    // 5度傾斜

    // 外層軌道群 - 較慢，傾斜變化大
    { radius: 200, count: 10, speed: 0.045, direction: 1,  tilt: 30 },   // 30度傾斜
    { radius: 230, count: 9,  speed: 0.035, direction: -1, tilt: 10 },   // 10度傾斜
    { radius: 260, count: 6,  speed: 0.025, direction: 1,  tilt: 20 },   // 20度傾斜
    { radius: 290, count: 4,  speed: 0.018, direction: -1, tilt: 35 },   // 35度傾斜（最外層最陡）
  ],
  // Total: 80 particles

  // 深度渲染（極大化差異讓 3D 效果非常明顯）
  minSize: 0.5,       // 遠處：非常小
  maxSize: 6,         // 近處：適中大小（原本 12 太大）
  minOpacity: 0.08,   // 遠處：幾乎看不見
  maxOpacity: 1.0,    // 近處：完全不透明
  minGlow: 1,
  maxGlow: 20,

  // 色彩配置 - 豐富的光暈顏色
  colors: [
    'hsl(190, 100%, 60%)',  // 青色
    'hsl(220, 100%, 65%)',  // 藍色
    'hsl(270, 80%, 65%)',   // 紫色
    'hsl(320, 80%, 60%)',   // 粉紅
    'hsl(45, 100%, 60%)',   // 金色
    'hsl(160, 80%, 55%)',   // 青綠
  ],

  // 拖尾效果
  trailLength: 0.9,   // 較長的拖尾
}

// 中心光核配置（太陽）
export const STAGE2_CORE_CONFIG: Partial<CoreGlowState> = {
  visible: true,
  opacity: 1,
  size: 100,
  rotationSpeed: 0.015,      // 非常慢速旋轉

  coreRadius: 18,            // 較大的核心（太陽）
  coreColor: 'hsl(45, 100%, 70%)',   // 金黃色核心
  coreGlow: 15,

  rayCount: 32,              // 更多光線
  rayLength: 45,
  rayWidth: 1.2,
  rayColor: 'hsl(40, 100%, 80%)',    // 暖黃色光線

  pulseSpeed: 0.1,           // 緩慢脈動
  pulseAmplitude: 0.06,
}

// 軌道快取（延遲初始化）
let orbitCache: CachedOrbitInfo[] | null = null

/**
 * 取得粒子軌道資訊（使用快取）
 */
function getParticleOrbit(particleId: number, particleCount: number): CachedOrbitInfo {
  // 延遲初始化快取
  if (!orbitCache || orbitCache.length !== particleCount) {
    orbitCache = getParticleOrbitCache(particleCount, STAGE2_CONFIG.orbits)
  }
  return orbitCache[particleId] || orbitCache[orbitCache.length - 1]
}

/**
 * 3D 點結構
 */
interface Point3D {
  x: number
  y: number
  z: number
}

/**
 * 繞 X 軸旋轉（傾斜效果）- 使用預計算的 cos/sin
 */
function rotateAroundXCached(point: Point3D, cos: number, sin: number): Point3D {
  return getPooledPoint3D(
    point.x,
    point.y * cos - point.z * sin,
    point.y * sin + point.z * cos
  )
}

/**
 * 透視投影 - 使用物件池
 * 返回 2D 座標和縮放因子
 */
function perspectiveProject(
  point: Point3D,
  focalLength: number
): { x: number; y: number; scale: number } {
  // 避免除以零或負值
  const z = Math.max(point.z + focalLength, 1)
  const scale = focalLength / z

  return getPooledProjection(
    point.x * scale,
    point.y * scale,
    scale
  )
}

/**
 * 計算深度相關屬性 - 使用物件池
 * @param z 當前 Z 座標（正值 = 遠離用戶，負值 = 靠近用戶）
 * @param maxZ 最大 Z 範圍（軌道半徑）
 */
function getDepthProperties(z: number, maxZ: number): {
  size: number
  opacity: number
  glow: number
} {
  const config = STAGE2_CONFIG
  // 正規化深度：z 從 -maxZ（最近）到 +maxZ（最遠）
  // 映射到 0（最遠）到 1（最近）
  const rawDepth = (-z + maxZ) / (2 * maxZ)  // 反轉 z，讓負 z（近）= 高值
  const normalizedDepth = Math.max(0, Math.min(1, rawDepth))

  // 使用更激進的 easing 曲線，讓深度差異更明顯
  // 使用 S 曲線讓中間值更分散，前後差異更大
  const easedDepth = normalizedDepth * normalizedDepth * (3 - 2 * normalizedDepth) // smoothstep
  // 再加強一次
  const finalDepth = Math.pow(easedDepth, 0.5)

  return getPooledDepth(
    lerp(config.minSize, config.maxSize, finalDepth),
    lerp(config.minOpacity, config.maxOpacity, finalDepth),
    lerp(config.minGlow, config.maxGlow, finalDepth)
  )
}

// 預設粒子數量（用於軌道快取）
const DEFAULT_PARTICLE_COUNT = 80

/**
 * Stage 2 變換函數
 * 行星軌道運動 + 3D 透視效果
 * 使用快取優化：預計算的軌道資訊、三角函數值、物件池
 */
export function stage2Transform(
  particle: Particle,
  context: TransformContext
): ParticleState {
  const { time, center } = context
  const config = STAGE2_CONFIG

  // 取得預計算的軌道資訊（包含 tiltCos/tiltSin 和 baseAngle）
  const orbit = getParticleOrbit(particle.id, DEFAULT_PARTICLE_COUNT)

  // 計算當前軌道角度（使用快取的 baseAngle）
  const currentAngle = orbit.baseAngle + time * orbit.speed * orbit.direction * Math.PI * 2

  // 在 XZ 平面上計算軌道位置（使用物件池）
  const point3D = getPooledPoint3D(
    Math.cos(currentAngle) * orbit.radius,
    0,
    Math.sin(currentAngle) * orbit.radius
  )

  // 應用傾斜（使用預計算的 tiltCos/tiltSin）
  const tilted = rotateAroundXCached(point3D, orbit.tiltCos, orbit.tiltSin)

  // 透視投影到 2D（使用物件池）
  const projected = perspectiveProject(tilted, config.focalLength)

  // 計算深度相關屬性（使用物件池）
  const depth = getDepthProperties(tilted.z, orbit.radius)

  // 根據軌道索引選擇顏色
  const colorIndex = orbit.orbitIndex % config.colors.length
  const color = config.colors[colorIndex]

  return {
    x: center.x + projected.x,
    y: center.y + projected.y,
    r: depth.size,
    opacity: depth.opacity,
    glow: depth.glow,
    trailLength: config.trailLength,
    color,
  }
}

/**
 * 取得指定軌道的當前屬性
 */
export function getOrbitInfo(orbitIndex: number): {
  radius: number
  speed: number
  direction: number
} | null {
  const orbit = STAGE2_CONFIG.orbits[orbitIndex]
  if (!orbit) return null
  return {
    radius: orbit.radius,
    speed: orbit.speed,
    direction: orbit.direction,
  }
}

/**
 * Stage 2 場景狀態
 * 太陽般的中心光核
 */
export function stage2SceneState(context: TransformContext): SceneState {
  const { time } = context

  return {
    core: {
      ...DEFAULT_CORE_STATE,
      ...STAGE2_CORE_CONFIG,
      visible: true,
      rotation: time * (STAGE2_CORE_CONFIG.rotationSpeed ?? 0.015),
    }
  }
}

export default stage2Transform
