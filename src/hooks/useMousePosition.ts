/**
 * Mouse Position Hook
 * 追蹤滑鼠在指定容器內的位置
 */

import { useRef, useEffect, useCallback } from 'react'
import type { Point } from '../particles/types'

interface UseMousePositionOptions {
  // 滑鼠離開時的預設位置（設為遠處以停止互動）
  defaultPosition?: Point
}

const DEFAULT_FAR_POSITION: Point = { x: -1000, y: -1000 }

export function useMousePosition(
  containerRef: React.RefObject<HTMLElement>,
  options: UseMousePositionOptions = {}
) {
  const { defaultPosition = DEFAULT_FAR_POSITION } = options

  // 使用 ref 避免每次更新都觸發重新渲染
  const positionRef = useRef<Point>(defaultPosition)

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    positionRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }, [containerRef])

  const handleMouseLeave = useCallback(() => {
    positionRef.current = defaultPosition
  }, [defaultPosition])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [containerRef, handleMouseMove, handleMouseLeave])

  // 返回 ref 供動畫循環讀取（不會觸發重新渲染）
  return positionRef
}

export default useMousePosition
