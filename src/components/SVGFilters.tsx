/**
 * SVGFilters - SVG 濾鏡定義
 * 包含粒子系統使用的光暈效果
 */


interface SVGFiltersProps {
  glowRef?: React.Ref<SVGFEGaussianBlurElement>
  glowIntensityRef?: React.Ref<SVGFEGaussianBlurElement>
}

/**
 * 粒子系統 SVG 濾鏡
 * - glow: 基礎光暈（Stage 0 使用）
 * - glow-intense: 強化脈動光暈（Stage 1-2 使用）
 */
export function SVGFilters({ glowRef, glowIntensityRef }: SVGFiltersProps) {
  return (
    <defs>
      {/* 基礎光暈濾鏡 */}
      <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur
          ref={glowRef}
          in="SourceGraphic"
          stdDeviation="4"
          result="blur"
        />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* 強化脈動光暈濾鏡 - 用於 Stage 1 */}
      <filter id="glow-intense" x="-150%" y="-150%" width="400%" height="400%">
        {/* 內層光暈 - 較小較亮 */}
        <feGaussianBlur
          in="SourceGraphic"
          stdDeviation="3"
          result="blur1"
        />
        {/* 中層光暈 - 主要脈動層 */}
        <feGaussianBlur
          ref={glowIntensityRef}
          in="SourceGraphic"
          stdDeviation="8"
          result="blur2"
        />
        {/* 外層光暈 - 最大範圍 */}
        <feGaussianBlur
          in="SourceGraphic"
          stdDeviation="15"
          result="blur3"
        />
        <feMerge>
          <feMergeNode in="blur3" />
          <feMergeNode in="blur2" />
          <feMergeNode in="blur2" />
          <feMergeNode in="blur1" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  )
}

export default SVGFilters
