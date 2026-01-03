/**
 * TimelineItem - 單個時間軸項目
 * 包含節點圓點、年份、標題和描述
 */

import type { TimelineEntry } from './types'

interface TimelineItemProps {
  entry: TimelineEntry
  isFirst: boolean
  isLast: boolean
}

export default function TimelineItem({
  entry,
  isFirst,
  isLast,
}: TimelineItemProps) {
  return (
    <div className="relative flex gap-4">
      {/* 時間軸線條和節點 */}
      <div className="flex flex-col items-center">
        {/* 上方連接線 */}
        {!isFirst && (
          <div className="w-0.5 h-4 bg-gradient-to-b from-cyan-400/20 to-cyan-400/60" />
        )}
        {isFirst && <div className="h-4" />}

        {/* 節點圓點 */}
        <div className="relative">
          {/* 外圈光暈 */}
          <div className="absolute inset-0 w-4 h-4 rounded-full bg-cyan-400/30 blur-sm" />
          {/* 主圓點 */}
          <div className="relative w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.6)]" />
        </div>

        {/* 下方連接線 */}
        {!isLast && (
          <div className="w-0.5 flex-1 min-h-[60px] bg-gradient-to-b from-cyan-400/60 to-cyan-400/20" />
        )}
      </div>

      {/* 內容 */}
      <div className="flex-1 pb-6">
        {/* 年份和標題 */}
        <div className="font-mono">
          <span className="text-cyan-400 text-lg font-bold">{entry.year}: </span>
          <span className="text-white text-lg">{entry.title}</span>
        </div>

        {/* 組織/機構 */}
        <div className="font-mono text-cyan-400/80 text-sm mt-0.5">
          @ {entry.organization}
        </div>

        {/* 描述 */}
        <p className="font-mono text-white/50 text-xs mt-2 leading-relaxed max-w-[280px]">
          {entry.description}
        </p>
      </div>
    </div>
  )
}
