/**
 * TimelineNav - 時間軸導航組件
 * 上/下箭頭按鈕，用於切換顯示的時間軸項目
 */

interface TimelineNavProps {
  canScrollUp: boolean
  canScrollDown: boolean
  onScrollUp: () => void
  onScrollDown: () => void
}

export default function TimelineNav({
  canScrollUp,
  canScrollDown,
  onScrollUp,
  onScrollDown,
}: TimelineNavProps) {
  return (
    <div className="flex flex-col items-center gap-2 ml-2">
      {/* 上箭頭 */}
      <button
        onClick={onScrollUp}
        disabled={!canScrollUp}
        className={`
          w-8 h-8 rounded-full border transition-all duration-200
          flex items-center justify-center
          ${canScrollUp
            ? 'border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400 cursor-pointer'
            : 'border-white/10 text-white/20 cursor-not-allowed'
          }
        `}
        aria-label="Show earlier entries"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className="transform rotate-180"
        >
          <path
            d="M6 9L6 3M6 9L2 5M6 9L10 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* 指示點 */}
      <div className="flex flex-col gap-1">
        <div className={`w-1.5 h-1.5 rounded-full ${canScrollUp ? 'bg-cyan-400/30' : 'bg-cyan-400'}`} />
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
        <div className={`w-1.5 h-1.5 rounded-full ${canScrollDown ? 'bg-cyan-400/30' : 'bg-cyan-400'}`} />
      </div>

      {/* 下箭頭 */}
      <button
        onClick={onScrollDown}
        disabled={!canScrollDown}
        className={`
          w-8 h-8 rounded-full border transition-all duration-200
          flex items-center justify-center
          ${canScrollDown
            ? 'border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400 cursor-pointer'
            : 'border-white/10 text-white/20 cursor-not-allowed'
          }
        `}
        aria-label="Show later entries"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M6 9L6 3M6 9L2 5M6 9L10 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  )
}
