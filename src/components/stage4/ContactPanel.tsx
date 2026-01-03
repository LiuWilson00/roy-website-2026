/**
 * ContactPanel - 聯絡面板容器
 * 2x2 Grid 佈局，中間有發光脊柱
 */

import type { ContactItem } from './types'
import ContactCard from './ContactCard'
import CentralSpine from './CentralSpine'

interface ContactPanelProps {
  items: ContactItem[]
  animate?: boolean
}

export default function ContactPanel({ items, animate = true }: ContactPanelProps) {
  // 確保有 4 個項目
  const [item0, item1, item2, item3] = items

  // 動畫延遲：左上 → 右上 → 左下 → 右下
  const delays = animate ? [0.1, 0.25, 0.4, 0.55] : [0, 0, 0, 0]

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* 桌面版：2x2 Grid + 中央脊柱 */}
      <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
        {/* 左欄 */}
        <div className="space-y-6">
          {item0 && <ContactCard item={item0} delay={delays[0]} />}
          {item2 && <ContactCard item={item2} delay={delays[2]} />}
        </div>

        {/* 中央脊柱 */}
        <CentralSpine className="self-stretch py-8" />

        {/* 右欄 */}
        <div className="space-y-6">
          {item1 && <ContactCard item={item1} delay={delays[1]} />}
          {item3 && <ContactCard item={item3} delay={delays[3]} />}
        </div>
      </div>

      {/* 手機版：單列，較緊湊間距 */}
      <div className="md:hidden space-y-3">
        {items.map((item, index) => (
          <ContactCard
            key={item.id}
            item={item}
            delay={animate ? 0.1 + index * 0.1 : 0}
          />
        ))}
      </div>
    </div>
  )
}
