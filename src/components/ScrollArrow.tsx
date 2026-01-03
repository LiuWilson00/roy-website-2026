/**
 * ScrollArrow - 可點擊的滾動箭頭
 * 顯示 "Scroll to Explore" 提示，點擊可跳到下一個 Stage
 */

interface ScrollArrowProps {
  text?: string
  onClick: () => void
}

export default function ScrollArrow({
  text = 'Scroll to Explore',
  onClick,
}: ScrollArrowProps) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center gap-2 pointer-events-auto cursor-pointer hover:opacity-80 transition-opacity"
    >
      <p className="font-mono text-white/40 text-xs tracking-[0.3em] uppercase group-hover:text-white/60 transition-colors">
        {text}
      </p>
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        className="animate-bounce group-hover:text-white/60"
      >
        <path
          d="M6 0L6 10M6 10L1 5M6 10L11 5"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-white/40 group-hover:text-white/60 transition-colors"
        />
      </svg>
    </button>
  )
}
