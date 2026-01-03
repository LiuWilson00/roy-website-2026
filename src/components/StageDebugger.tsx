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
  // 已停用 debug 顯示
  return null
}

export default StageDebugger
