/**
 * GalaxyNav - 星系導航控制
 * 左右箭頭放在畫面兩側，分頁指示點放在中央
 */

interface GalaxyNavProps {
  currentPage: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
  onGoToPage: (page: number) => void
  disabled?: boolean
}

export default function GalaxyNav({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  onGoToPage,
  disabled = false,
}: GalaxyNavProps) {
  const canGoPrev = currentPage > 0
  const canGoNext = currentPage < totalPages - 1

  return (
    <>
      {/* 左箭頭 - 畫面左側垂直置中 */}
      <button
        onClick={onPrev}
        disabled={!canGoPrev || disabled}
        className={`
          fixed left-4 md:left-8 top-1/2 -translate-y-1/2 z-30
          w-10 h-10 md:w-12 md:h-12 rounded-full
          flex items-center justify-center
          border transition-all duration-200 pointer-events-auto
          ${canGoPrev && !disabled
            ? 'border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/20 hover:border-cyan-400 cursor-pointer'
            : 'border-white/10 text-white/20 cursor-not-allowed'
          }
        `}
        style={{
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(0,0,0,0.3)',
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            d="M12.5 15L7.5 10L12.5 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* 右箭頭 - 畫面右側垂直置中 */}
      <button
        onClick={onNext}
        disabled={!canGoNext || disabled}
        className={`
          fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-30
          w-10 h-10 md:w-12 md:h-12 rounded-full
          flex items-center justify-center
          border transition-all duration-200 pointer-events-auto
          ${canGoNext && !disabled
            ? 'border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/20 hover:border-cyan-400 cursor-pointer'
            : 'border-white/10 text-white/20 cursor-not-allowed'
          }
        `}
        style={{
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(0,0,0,0.3)',
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            d="M7.5 5L12.5 10L7.5 15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* 分頁指示點 - 畫面底部中央 */}
      <div className="fixed bottom-20 md:bottom-24 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 pointer-events-auto">
        {Array.from({ length: totalPages }).map((_, index) => (
          <button
            key={index}
            onClick={() => onGoToPage(index)}
            disabled={disabled || index === currentPage}
            className={`
              w-3 h-3 rounded-full transition-all duration-300 cursor-pointer
              hover:scale-150
              ${index === currentPage
                ? 'bg-cyan-400 shadow-[0_0_8px_rgba(0,255,255,0.6)] scale-125'
                : 'bg-white/30 hover:bg-white/60'
              }
            `}
          />
        ))}
      </div>
    </>
  )
}
