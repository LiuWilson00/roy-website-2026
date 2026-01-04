/**
 * StarField - 視差星空背景
 * 參考: https://codepen.io/sarazond/pen/LYGbwj
 * 三層星星以不同速度移動，創造深度感
 */

import { useMemo } from 'react'
import './StarField.css'

interface StarFieldProps {
  /** 控制星空可見度 (0-1) */
  opacity?: number
}

// 生成隨機星星位置的 box-shadow
function generateStars(count: number, maxPos: number = 2000): string {
  const stars: string[] = []
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * maxPos)
    const y = Math.floor(Math.random() * maxPos)
    stars.push(`${x}px ${y}px #FFF`)
  }
  return stars.join(', ')
}

export default function StarField({ opacity = 1 }: StarFieldProps) {
  // 使用 useMemo 確保星星位置只在首次渲染時生成
  const stars = useMemo(() => ({
    small: generateStars(700),
    medium: generateStars(200),
    big: generateStars(100),
  }), [])

  return (
    <div
      className="star-field"
      style={{ opacity }}
    >
      <div
        className="stars stars-small"
        style={{ boxShadow: stars.small }}
      />
      <div
        className="stars stars-medium"
        style={{ boxShadow: stars.medium }}
      />
      <div
        className="stars stars-big"
        style={{ boxShadow: stars.big }}
      />
    </div>
  )
}
