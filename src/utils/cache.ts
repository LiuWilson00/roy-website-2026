/**
 * 效能快取工具
 * 用於快取昂貴的計算結果
 */

// ============ 1. 三角函數快取 ============

/**
 * 粒子三角函數快取
 * 每個粒子的 theta 是固定的，cos/sin 值可以預先計算
 */
interface TrigCache {
  cos: number
  sin: number
}

// 粒子 theta 的三角函數快取（按粒子數量索引）
const particleTrigCache = new Map<number, TrigCache[]>()

/**
 * 初始化或取得粒子三角函數快取
 * @param count 粒子數量
 * @returns 每個粒子的 cos/sin 值陣列
 */
export function getParticleTrigCache(count: number): TrigCache[] {
  if (particleTrigCache.has(count)) {
    return particleTrigCache.get(count)!
  }

  // 預先計算所有粒子的 theta 對應的 cos/sin
  const cache: TrigCache[] = []
  for (let i = 0; i < count; i++) {
    const theta = (i / count) * Math.PI * 2
    cache.push({
      cos: Math.cos(theta),
      sin: Math.sin(theta),
    })
  }

  particleTrigCache.set(count, cache)
  return cache
}

/**
 * 軌道傾斜角度的三角函數快取（Stage 2 用）
 * key = 傾斜角度（度），value = cos/sin
 */
const orbitTiltCache = new Map<number, TrigCache>()

/**
 * 取得軌道傾斜角的三角函數值（快取版本）
 */
export function getOrbitTiltTrig(tiltDegrees: number): TrigCache {
  if (orbitTiltCache.has(tiltDegrees)) {
    return orbitTiltCache.get(tiltDegrees)!
  }

  const radians = tiltDegrees * Math.PI / 180
  const cache: TrigCache = {
    cos: Math.cos(radians),
    sin: Math.sin(radians),
  }

  orbitTiltCache.set(tiltDegrees, cache)
  return cache
}

// ============ 2. HSL 顏色解析快取 ============

/**
 * HSL 解析結果快取
 * 避免重複使用正則表達式解析相同的顏色字串
 */
interface ParsedHSL {
  h: number
  s: number
  l: number
}

const hslParseCache = new Map<string, ParsedHSL | null>()

/**
 * 解析 HSL 字串（快取版本）
 * 支援 "hsl(h, s%, l%)" 格式和 'white' 特殊值
 */
export function parseHSLCached(hslString: string): ParsedHSL | null {
  // 檢查快取
  if (hslParseCache.has(hslString)) {
    return hslParseCache.get(hslString)!
  }

  let result: ParsedHSL | null = null

  // 處理 'white' 特殊值
  if (hslString.toLowerCase() === 'white') {
    result = { h: 0, s: 0, l: 100 }
  } else {
    const match = hslString.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
    if (match) {
      result = {
        h: parseInt(match[1], 10),
        s: parseInt(match[2], 10),
        l: parseInt(match[3], 10),
      }
    }
  }

  // 存入快取
  hslParseCache.set(hslString, result)
  return result
}

/**
 * 預先快取常用顏色
 * 在應用啟動時呼叫，避免第一次解析的開銷
 */
export function preCacheCommonColors(): void {
  const commonColors = [
    'white',
    'hsl(180, 100%, 70%)',   // Cyan
    'hsl(300, 100%, 70%)',   // Magenta
    'hsl(240, 100%, 80%)',   // Blue-purple
    'hsl(280, 100%, 80%)',   // Purple (core)
    'hsl(200, 100%, 85%)',   // Cyan (ray)
    'hsl(45, 100%, 70%)',    // Gold (sun core)
    'hsl(40, 100%, 80%)',    // Warm yellow (sun ray)
  ]

  commonColors.forEach(color => parseHSLCached(color))
}

// ============ 3. 物件池（減少 GC） ============

/**
 * 2D 座標物件池
 * 用於 polarToCartesian 等頻繁創建 {x, y} 物件的函數
 */
interface Point2D {
  x: number
  y: number
}

const point2DPool: Point2D[] = []
const POOL_SIZE = 200 // 足夠容納 2 倍粒子數量的物件

// 預先填充物件池
for (let i = 0; i < POOL_SIZE; i++) {
  point2DPool.push({ x: 0, y: 0 })
}

let point2DIndex = 0

/**
 * 從物件池取得 2D 座標物件
 * 注意：這些物件會被循環使用，不要長期持有引用
 */
export function getPooledPoint2D(x: number, y: number): Point2D {
  const point = point2DPool[point2DIndex]
  point.x = x
  point.y = y
  point2DIndex = (point2DIndex + 1) % POOL_SIZE
  return point
}

/**
 * 3D 座標物件池（Stage 2 用）
 */
interface Point3D {
  x: number
  y: number
  z: number
}

const point3DPool: Point3D[] = []

for (let i = 0; i < POOL_SIZE; i++) {
  point3DPool.push({ x: 0, y: 0, z: 0 })
}

let point3DIndex = 0

/**
 * 從物件池取得 3D 座標物件
 */
export function getPooledPoint3D(x: number, y: number, z: number): Point3D {
  const point = point3DPool[point3DIndex]
  point.x = x
  point.y = y
  point.z = z
  point3DIndex = (point3DIndex + 1) % POOL_SIZE
  return point
}

/**
 * 投影結果物件池
 */
interface ProjectionResult {
  x: number
  y: number
  scale: number
}

const projectionPool: ProjectionResult[] = []

for (let i = 0; i < POOL_SIZE; i++) {
  projectionPool.push({ x: 0, y: 0, scale: 1 })
}

let projectionIndex = 0

export function getPooledProjection(x: number, y: number, scale: number): ProjectionResult {
  const proj = projectionPool[projectionIndex]
  proj.x = x
  proj.y = y
  proj.scale = scale
  projectionIndex = (projectionIndex + 1) % POOL_SIZE
  return proj
}

/**
 * 深度屬性物件池
 */
interface DepthProperties {
  size: number
  opacity: number
  glow: number
}

const depthPool: DepthProperties[] = []

for (let i = 0; i < POOL_SIZE; i++) {
  depthPool.push({ size: 0, opacity: 0, glow: 0 })
}

let depthIndex = 0

export function getPooledDepth(size: number, opacity: number, glow: number): DepthProperties {
  const depth = depthPool[depthIndex]
  depth.size = size
  depth.opacity = opacity
  depth.glow = glow
  depthIndex = (depthIndex + 1) % POOL_SIZE
  return depth
}

/**
 * 重置所有物件池索引（可選，每幀開始時呼叫）
 */
export function resetPoolIndices(): void {
  point2DIndex = 0
  point3DIndex = 0
  projectionIndex = 0
  depthIndex = 0
}

// ============ Stage 2 軌道資訊快取 ============

/**
 * 軌道資訊（預計算）
 */
export interface CachedOrbitInfo {
  orbitIndex: number
  radius: number
  speed: number
  direction: number
  tilt: number
  tiltCos: number      // 預計算的 cos(tilt)
  tiltSin: number      // 預計算的 sin(tilt)
  localIndex: number
  totalInOrbit: number
  baseAngle: number    // 預計算的基礎角度
}

// 粒子到軌道資訊的映射快取
const particleOrbitCache = new Map<number, CachedOrbitInfo[]>()

/**
 * 初始化或取得粒子軌道資訊快取
 */
export function getParticleOrbitCache(
  particleCount: number,
  orbits: Array<{ radius: number; count: number; speed: number; direction: number; tilt: number }>
): CachedOrbitInfo[] {
  if (particleOrbitCache.has(particleCount)) {
    return particleOrbitCache.get(particleCount)!
  }

  const cache: CachedOrbitInfo[] = []

  for (let particleId = 0; particleId < particleCount; particleId++) {
    // 找到這個粒子所屬的軌道
    let foundOrbit = false
    let tempAccumulated = 0

    for (let i = 0; i < orbits.length; i++) {
      const orbit = orbits[i]
      if (particleId < tempAccumulated + orbit.count) {
        const localIndex = particleId - tempAccumulated
        const tiltRadians = orbit.tilt * Math.PI / 180

        cache.push({
          orbitIndex: i,
          radius: orbit.radius,
          speed: orbit.speed,
          direction: orbit.direction,
          tilt: orbit.tilt,
          tiltCos: Math.cos(tiltRadians),
          tiltSin: Math.sin(tiltRadians),
          localIndex,
          totalInOrbit: orbit.count,
          baseAngle: (localIndex / orbit.count) * Math.PI * 2,
        })
        foundOrbit = true
        break
      }
      tempAccumulated += orbit.count
    }

    // Fallback 到最後一個軌道
    if (!foundOrbit) {
      const lastOrbit = orbits[orbits.length - 1]
      const tiltRadians = lastOrbit.tilt * Math.PI / 180
      cache.push({
        orbitIndex: orbits.length - 1,
        radius: lastOrbit.radius,
        speed: lastOrbit.speed,
        direction: lastOrbit.direction,
        tilt: lastOrbit.tilt,
        tiltCos: Math.cos(tiltRadians),
        tiltSin: Math.sin(tiltRadians),
        localIndex: 0,
        totalInOrbit: lastOrbit.count,
        baseAngle: 0,
      })
    }
  }

  particleOrbitCache.set(particleCount, cache)
  return cache
}

// 啟動時預先快取常用顏色
preCacheCommonColors()
