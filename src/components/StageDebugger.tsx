/**
 * StageDebugger - Debug UI 組件
 * 顯示當前 Stage 和進度資訊
 * 只在開發環境中使用
 */

interface StageDebuggerProps {
  scrollProgress: number
}

/**
 * 顯示當前 Stage 狀態的 Debug 組件
 */
export function StageDebugger({ scrollProgress }: StageDebuggerProps) {
  // 只在開發環境中渲染
  if (import.meta.env.PROD) {
    return null
  }

  const currentStage = Math.floor(scrollProgress)
  const stageProgress = scrollProgress % 1

  return (
    <div className="absolute top-4 right-4 text-white/30 font-mono text-xs">
      Stage: {currentStage} | Progress: {(stageProgress * 100).toFixed(0)}%
    </div>
  )
}

export default StageDebugger
