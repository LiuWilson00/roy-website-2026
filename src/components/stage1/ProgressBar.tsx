/**
 * ProgressBar - 技能進度條組件
 * 帶光暈效果的進度條，支援動畫填充
 */

import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import { SKILL_COLORS } from './types'

interface ProgressBarProps {
  percentage: number
  color: 'cyan' | 'magenta' | 'blue'
  animate?: boolean
  delay?: number
}

export default function ProgressBar({
  percentage,
  color,
  animate = true,
  delay = 0,
}: ProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null)
  const [displayValue, setDisplayValue] = useState(animate ? 0 : percentage)
  const colors = SKILL_COLORS[color]

  useEffect(() => {
    if (!animate || !barRef.current) return

    // 進度條填充動畫
    gsap.fromTo(
      barRef.current,
      { width: '0%' },
      {
        width: `${percentage}%`,
        duration: 1.2,
        ease: 'power2.out',
        delay,
      }
    )

    // 數字計數動畫
    const counter = { value: 0 }
    gsap.to(counter, {
      value: percentage,
      duration: 1.2,
      ease: 'power2.out',
      delay,
      onUpdate: () => {
        setDisplayValue(Math.round(counter.value))
      },
    })
  }, [percentage, animate, delay])

  return (
    <div className="w-full">
      {/* 進度條容器 */}
      <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
        {/* 進度條填充 */}
        <div
          ref={barRef}
          className={`absolute inset-y-0 left-0 rounded-full ${colors.bar} ${colors.glow}`}
          style={{ width: animate ? '0%' : `${percentage}%` }}
        />
      </div>

      {/* 百分比數字 */}
      <div className={`mt-1 text-right font-mono text-xs ${colors.text}`}>
        {displayValue}%
      </div>
    </div>
  )
}
