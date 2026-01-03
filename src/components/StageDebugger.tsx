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
export function StageDebugger({ scrollProgress: _scrollProgress }: StageDebuggerProps) {
  // 已停用 debug 顯示
  void _scrollProgress
  return null
}

export default StageDebugger
