import { useRef, useMemo, useState, useEffect } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

// 配置常數
const CONFIG = {
  COUNT: 80,
  BASE_RADIUS: 180,
  // 點擊互動
  RIPPLE_RADIUS: 150,
  RIPPLE_STRENGTH: 30,
  RIPPLE_DURATION: 0.8,
  // 滑鼠追蹤互動
  HOVER_RADIUS: 200,        // 滑鼠影響範圍
  HOVER_MAX_AMPLITUDE: 8,   // 最大振幅
  HOVER_FREQUENCY: 3,       // 擺動頻率（時間）
  HOVER_WAVE_COUNT: 3,      // 圓周上的波數（整數確保首尾相接）
}

interface Dot {
  id: number
  angle: number
}

function generateDots(): Dot[] {
  return Array.from({ length: CONFIG.COUNT }).map((_, i) => ({
    id: i,
    angle: (i / CONFIG.COUNT) * Math.PI * 2,
  }))
}

export default function CyberIris() {
  const containerRef = useRef<HTMLDivElement>(null)
  const dotsRef = useRef<(SVGCircleElement | null)[]>([])
  const glowRef = useRef<SVGFEGaussianBlurElement>(null)

  // 每個點的偏移量（點擊擾動）
  const clickOffsetsRef = useRef<number[]>([])

  // 當前呼吸半徑
  const breathRadiusRef = useRef(CONFIG.BASE_RADIUS)

  // 滑鼠位置
  const mouseRef = useRef({ x: -1000, y: -1000 })

  // 動態取得視窗中心
  const [center, setCenter] = useState({ x: 0, y: 0 })

  const dots = useMemo(() => generateDots(), [])

  // 初始化偏移量
  useEffect(() => {
    clickOffsetsRef.current = dots.map(() => 0)
  }, [dots])

  useEffect(() => {
    const updateCenter = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setCenter({ x: rect.width / 2, y: rect.height / 2 })
      }
    }
    updateCenter()
    window.addEventListener('resize', updateCenter)
    return () => window.removeEventListener('resize', updateCenter)
  }, [])

  // 滑鼠移動追蹤
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    const handleMouseLeave = () => {
      // 滑鼠離開時，設置到很遠的位置
      mouseRef.current = { x: -1000, y: -1000 }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('mousemove', handleMouseMove)
      container.addEventListener('mouseleave', handleMouseLeave)
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove)
        container.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [])

  // 計算滑鼠擾動（基於時間的正弦波 + 滑鼠距離）
  const calculateHoverOffset = (dotIndex: number, time: number): number => {
    const dot = dots[dotIndex]
    const currentRadius = breathRadiusRef.current
    const dotX = center.x + Math.cos(dot.angle) * currentRadius
    const dotY = center.y + Math.sin(dot.angle) * currentRadius

    const mouse = mouseRef.current
    const dx = dotX - mouse.x
    const dy = dotY - mouse.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance > CONFIG.HOVER_RADIUS) return 0

    // 距離越近，振幅越大
    const proximityFactor = 1 - distance / CONFIG.HOVER_RADIUS
    const amplitude = proximityFactor * CONFIG.HOVER_MAX_AMPLITUDE

    // 使用角度作為相位基礎，乘以整數波數確保首尾相接無斷層
    const phase = dot.angle * CONFIG.HOVER_WAVE_COUNT
    const oscillation = Math.sin(time * CONFIG.HOVER_FREQUENCY + phase) * amplitude

    return oscillation
  }

  // 更新所有點的位置
  const updateAllDots = (time: number) => {
    const dotElements = dotsRef.current
    if (center.x === 0) return

    dotElements.forEach((dot, i) => {
      if (!dot) return
      const angle = dots[i].angle

      // 疊加三層效果：呼吸 + 點擊擾動 + 滑鼠擾動
      const breathRadius = breathRadiusRef.current
      const clickOffset = clickOffsetsRef.current[i] || 0
      const hoverOffset = calculateHoverOffset(i, time)

      const totalRadius = breathRadius + clickOffset + hoverOffset
      const x = center.x + Math.cos(angle) * totalRadius
      const y = center.y + Math.sin(angle) * totalRadius

      dot.setAttribute('cx', String(x))
      dot.setAttribute('cy', String(y))
    })
  }

  // 點擊處理：產生漣漪擾動
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (center.x === 0) return

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top

    dots.forEach((dot, i) => {
      const currentRadius = breathRadiusRef.current + (clickOffsetsRef.current[i] || 0)
      const dotX = center.x + Math.cos(dot.angle) * currentRadius
      const dotY = center.y + Math.sin(dot.angle) * currentRadius

      const dx = dotX - clickX
      const dy = dotY - clickY
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < CONFIG.RIPPLE_RADIUS) {
        const strength = (1 - distance / CONFIG.RIPPLE_RADIUS) * CONFIG.RIPPLE_STRENGTH
        const offsetObj = { value: clickOffsetsRef.current[i] || 0 }

        gsap.killTweensOf(offsetObj)

        gsap.to(offsetObj, {
          value: strength,
          duration: 0.1,
          ease: 'power2.out',
          onUpdate: () => {
            clickOffsetsRef.current[i] = offsetObj.value
          },
          onComplete: () => {
            gsap.to(offsetObj, {
              value: 0,
              duration: CONFIG.RIPPLE_DURATION,
              ease: 'elastic.out(1, 0.3)',
              onUpdate: () => {
                clickOffsetsRef.current[i] = offsetObj.value
              },
            })
          },
        })
      }
    })
  }

  // 主動畫循環
  useGSAP(() => {
    if (center.x === 0) return

    const ctx = gsap.context(() => {
      // 呼吸動畫
      const breathProxy = { radius: CONFIG.BASE_RADIUS }

      gsap.to(breathProxy, {
        radius: CONFIG.BASE_RADIUS * 1.12,
        duration: 4,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        onUpdate: () => {
          breathRadiusRef.current = breathProxy.radius
        },
      })

      // 主更新循環（使用 GSAP ticker）
      const tickHandler = () => {
        updateAllDots(gsap.ticker.time)
      }
      gsap.ticker.add(tickHandler)

      // 光暈脈動
      if (glowRef.current) {
        gsap.to(glowRef.current, {
          attr: { stdDeviation: 8 },
          duration: 4,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        })
      }

      // Cleanup
      return () => {
        gsap.ticker.remove(tickHandler)
      }

    }, containerRef)

    return () => ctx.revert()
  }, { scope: containerRef, dependencies: [center] })

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-black overflow-hidden cursor-pointer"
      onClick={handleClick}
    >
      {center.x > 0 && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur
                ref={glowRef}
                in="SourceGraphic"
                stdDeviation="4"
                result="blur"
              />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g filter="url(#glow)">
            {dots.map((dot, i) => {
              const x = center.x + Math.cos(dot.angle) * CONFIG.BASE_RADIUS
              const y = center.y + Math.sin(dot.angle) * CONFIG.BASE_RADIUS
              return (
                <circle
                  key={dot.id}
                  ref={(el) => { dotsRef.current[i] = el }}
                  cx={x}
                  cy={y}
                  r={3}
                  fill="white"
                />
              )
            })}
          </g>
        </svg>
      )}

      {/* 標題 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
        <h1 className="text-white/10 font-mono text-2xl tracking-[0.3em] uppercase">
          Cyber Iris
        </h1>
      </div>

      {/* 底部提示 */}
      <div className="absolute bottom-10 w-full text-center text-gray-600 font-mono text-sm animate-pulse">
        SCROLL TO EXPLORE
      </div>
    </div>
  )
}
