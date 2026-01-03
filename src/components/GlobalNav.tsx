/**
 * GlobalNav - 全域導航組件
 * 左上角 Menu + 快速導覽功能
 */

import { useState, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

interface GlobalNavProps {
  scrollProgress: number
  onNavigate: (stage: number) => void
}

// 導航項目
const NAV_ITEMS = [
  { stage: 0, label: 'Home', description: 'Introduction' },
  { stage: 1, label: 'Journey', description: 'Experience & Skills' },
  { stage: 2, label: 'Projects', description: 'Project Galaxy' },
  { stage: 3, label: 'Contact', description: 'Get in Touch' },
]

export default function GlobalNav({ scrollProgress, onNavigate }: GlobalNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([])

  // 當前 Stage
  const currentStage = Math.round(scrollProgress)

  // 開啟/關閉選單動畫
  useGSAP(() => {
    if (!menuRef.current) return

    if (isOpen) {
      // 開啟動畫（從右側滑入）
      gsap.fromTo(
        menuRef.current,
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' }
      )
      // 項目依序淡入
      gsap.fromTo(
        itemsRef.current.filter(Boolean),
        { opacity: 0, x: 10 },
        {
          opacity: 1,
          x: 0,
          duration: 0.3,
          stagger: 0.05,
          ease: 'power2.out',
          delay: 0.1,
        }
      )
    }
  }, [isOpen])

  const handleNavigate = (stage: number) => {
    onNavigate(stage)
    setIsOpen(false)
  }

  return (
    <>
      {/* 漢堡選單按鈕 - 右上角，線條靠右對齊 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 right-6 z-50 w-10 h-10 flex flex-col justify-center items-end gap-1.5 pointer-events-auto hover:opacity-70 transition-all"
        aria-label="Toggle menu"
      >
        <span
          className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
            isOpen ? 'rotate-45 translate-y-2' : ''
          }`}
        />
        <span
          className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
            isOpen ? 'opacity-0' : ''
          }`}
        />
        <span
          className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
            isOpen ? '-rotate-45 -translate-y-2' : ''
          }`}
        />
      </button>

      {/* 導航選單面板 */}
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <div
            className="fixed inset-0 z-40 bg-black/50 pointer-events-auto"
            onClick={() => setIsOpen(false)}
          />

          {/* 選單內容 */}
          <div
            ref={menuRef}
            className="fixed top-20 right-6 z-50 pointer-events-auto"
            style={{ opacity: 0 }}
          >
            <div
              className="bg-black/90 border border-white/20 rounded-lg overflow-hidden"
              style={{
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
              }}
            >
              {/* 選單標題 */}
              <div className="px-5 py-3 border-b border-white/10">
                <p className="font-mono text-xs text-white/50 tracking-wider uppercase">
                  Navigation
                </p>
              </div>

              {/* 導航項目 */}
              <div className="py-2">
                {NAV_ITEMS.map((item, index) => (
                  <button
                    key={item.stage}
                    ref={(el) => { itemsRef.current[index] = el }}
                    onClick={() => handleNavigate(item.stage)}
                    className={`
                      w-full px-5 py-3 flex items-center gap-4 text-left
                      transition-all duration-200 hover:bg-white/10
                      ${currentStage === item.stage ? 'bg-white/5' : ''}
                    `}
                  >
                    {/* Stage 指示器 */}
                    <div
                      className={`
                        w-2 h-2 rounded-full transition-all
                        ${currentStage === item.stage
                          ? 'bg-cyan-400 shadow-[0_0_8px_rgba(0,255,255,0.6)]'
                          : 'bg-white/30'
                        }
                      `}
                    />

                    {/* 標籤 */}
                    <div>
                      <p
                        className={`
                          font-mono text-sm tracking-wider
                          ${currentStage === item.stage ? 'text-cyan-400' : 'text-white'}
                        `}
                      >
                        {item.label}
                      </p>
                      <p className="font-mono text-xs text-white/40">
                        {item.description}
                      </p>
                    </div>

                    {/* 當前指示 */}
                    {currentStage === item.stage && (
                      <span className="ml-auto font-mono text-xs text-cyan-400/60">
                        ●
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
