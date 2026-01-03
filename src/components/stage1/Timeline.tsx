/**
 * Timeline - 時間軸主組件
 * 管理可見項目和導航邏輯
 */

import { useState, useRef, useCallback } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import type { TimelineEntry } from './types'
import TimelineItem from './TimelineItem'
import TimelineNav from './TimelineNav'

interface TimelineProps {
  entries: TimelineEntry[]
  visibleCount?: number
  animate?: boolean
}

export default function Timeline({
  entries,
  visibleCount = 3,
  animate = true,
}: TimelineProps) {
  const [startIndex, setStartIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<HTMLDivElement>(null)

  // 計算可見項目
  const visibleEntries = entries.slice(startIndex, startIndex + visibleCount)
  const canScrollUp = startIndex > 0
  const canScrollDown = startIndex + visibleCount < entries.length

  // 導航處理
  const handleScrollUp = useCallback(() => {
    if (!canScrollUp || !itemsRef.current) return

    // 動畫：項目向下滑出，新項目從上滑入
    const items = itemsRef.current.children
    gsap.to(items, {
      y: 30,
      opacity: 0,
      duration: 0.2,
      stagger: 0.05,
      ease: 'power2.in',
      onComplete: () => {
        setStartIndex(prev => Math.max(0, prev - 1))
        // 新項目從上滑入
        gsap.fromTo(
          items,
          { y: -30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.3, stagger: 0.08, ease: 'power2.out' }
        )
      },
    })
  }, [canScrollUp])

  const handleScrollDown = useCallback(() => {
    if (!canScrollDown || !itemsRef.current) return

    // 動畫：項目向上滑出，新項目從下滑入
    const items = itemsRef.current.children
    gsap.to(items, {
      y: -30,
      opacity: 0,
      duration: 0.2,
      stagger: 0.05,
      ease: 'power2.in',
      onComplete: () => {
        setStartIndex(prev => Math.min(entries.length - visibleCount, prev + 1))
        // 新項目從下滑入
        gsap.fromTo(
          items,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.3, stagger: 0.08, ease: 'power2.out' }
        )
      },
    })
  }, [canScrollDown, entries.length, visibleCount])

  // 進場動畫
  useGSAP(() => {
    if (!animate || !containerRef.current) return

    gsap.fromTo(
      containerRef.current,
      { x: -80, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
        delay: 0.2,
      }
    )

    // 項目交錯進場
    if (itemsRef.current) {
      gsap.fromTo(
        itemsRef.current.children,
        { x: -30, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.12,
          ease: 'power2.out',
          delay: 0.5,
        }
      )
    }
  }, { scope: containerRef })

  return (
    <div
      ref={containerRef}
      className="flex items-start"
      style={{ opacity: animate ? 0 : 1 }}
    >
      {/* 時間軸項目 */}
      <div ref={itemsRef} className="flex-1">
        {visibleEntries.map((entry, index) => (
          <TimelineItem
            key={entry.id}
            entry={entry}
            isFirst={index === 0 && startIndex === 0}
            isLast={index === visibleEntries.length - 1 && startIndex + visibleCount >= entries.length}
          />
        ))}
      </div>

      {/* 導航按鈕（只有超過 visibleCount 項目時才顯示） */}
      {entries.length > visibleCount && (
        <TimelineNav
          canScrollUp={canScrollUp}
          canScrollDown={canScrollDown}
          onScrollUp={handleScrollUp}
          onScrollDown={handleScrollDown}
        />
      )}
    </div>
  )
}
