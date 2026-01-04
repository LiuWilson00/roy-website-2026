/**
 * TimelineItem - 單個時間軸項目
 * 顯示工作經歷：公司、職稱、時間、職責、技術棧
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
          <div className="w-0.5 flex-1 min-h-[80px] bg-gradient-to-b from-cyan-400/60 to-cyan-400/20" />
        )}
      </div>

      {/* 內容 */}
      <div className="flex-1 pb-6">
        {/* 職稱 */}
        <div className="font-mono text-white text-base md:text-lg font-semibold">
          {entry.title}
        </div>

        {/* 公司 */}
        <div className="font-mono text-cyan-400 text-sm mt-0.5">
          @ {entry.company}
        </div>

        {/* 時間 */}
        <div className="font-mono text-white/40 text-xs mt-1">
          {entry.period}
        </div>

        {/* 職責 - 只顯示前 2 項 */}
        <ul className="mt-2 space-y-1">
          {entry.responsibilities.slice(0, 2).map((resp, idx) => (
            <li
              key={idx}
              className="font-mono text-white/50 text-xs leading-relaxed flex items-start gap-1.5"
            >
              <span className="text-cyan-400/60 mt-0.5">›</span>
              <span className="max-w-[250px]">{resp}</span>
            </li>
          ))}
        </ul>

        {/* 技術棧 */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {entry.techStack.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="px-1.5 py-0.5 text-[10px] font-mono text-cyan-400/80 border border-cyan-400/30 rounded"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
