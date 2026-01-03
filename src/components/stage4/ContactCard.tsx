/**
 * ContactCard - 單一聯絡卡片
 * 玻璃形態 + 角落裝飾 + 發光效果
 */

import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import type { ContactItem } from './types'
import { CONTACT_COLORS } from './types'
import { iconMap } from './icons'

interface ContactCardProps {
  item: ContactItem
  delay?: number
}

export default function ContactCard({ item, delay = 0 }: ContactCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null)
  const [copied, setCopied] = useState(false)

  const Icon = iconMap[item.type]

  // 進場動畫
  useGSAP(() => {
    if (!cardRef.current) return

    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 30, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        delay,
        ease: 'power2.out',
      }
    )
  }, [delay])

  // 複製到剪貼簿
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // 點擊處理
  const handleClick = (e: React.MouseEvent) => {
    if (item.action === 'copy') {
      e.preventDefault()
      copyToClipboard(item.subtitle)
    }
    // link 和 download 使用預設的 <a> 行為
  }

  // Hover 動畫
  const handleMouseEnter = () => {
    if (!cardRef.current) return
    gsap.to(cardRef.current, {
      scale: 1.03,
      duration: 0.3,
      ease: 'power2.out',
    })
  }

  const handleMouseLeave = () => {
    if (!cardRef.current) return
    gsap.to(cardRef.current, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.out',
    })
  }

  return (
    <a
      ref={cardRef}
      href={item.href}
      target={item.action === 'link' ? '_blank' : undefined}
      rel={item.action === 'link' ? 'noopener noreferrer' : undefined}
      download={item.action === 'download' ? true : undefined}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative block p-4 md:p-8 rounded-xl cursor-pointer transition-all duration-300 group"
      style={{
        opacity: 0,
        background: CONTACT_COLORS.cardBg,
        border: `1px solid ${CONTACT_COLORS.cardBorder}`,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: `0 0 20px rgba(0, 200, 255, 0.1), inset 0 0 20px rgba(0, 200, 255, 0.05)`,
      }}
    >
      {/* 角落裝飾 */}
      <div
        className="absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2"
        style={{ borderColor: CONTACT_COLORS.primary }}
      />
      <div
        className="absolute -top-px -right-px w-3 h-3 border-t-2 border-r-2"
        style={{ borderColor: CONTACT_COLORS.primary }}
      />
      <div
        className="absolute -bottom-px -left-px w-3 h-3 border-b-2 border-l-2"
        style={{ borderColor: CONTACT_COLORS.primary }}
      />
      <div
        className="absolute -bottom-px -right-px w-3 h-3 border-b-2 border-r-2"
        style={{ borderColor: CONTACT_COLORS.primary }}
      />

      {/* Hover 發光邊框 */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          border: `1px solid ${CONTACT_COLORS.cardBorderHover}`,
          boxShadow: `0 0 40px ${CONTACT_COLORS.primaryGlow}, inset 0 0 30px rgba(0, 200, 255, 0.1)`,
        }}
      />

      {/* 內容 */}
      <div className="relative flex flex-col items-center text-center">
        {/* 圖標 */}
        <div
          className="mb-4 transition-all duration-300 group-hover:drop-shadow-[0_0_10px_rgba(0,200,255,0.8)]"
          style={{ color: CONTACT_COLORS.primary }}
        >
          <Icon size={40} />
        </div>

        {/* 標題 */}
        <h3 className="font-mono text-lg font-bold tracking-wider text-white mb-2">
          {item.title}
        </h3>

        {/* 副標題 */}
        <p className="font-mono text-sm text-white/60 group-hover:text-white/80 transition-colors">
          {copied ? 'Copied!' : item.subtitle}
        </p>
      </div>

      {/* 複製提示 */}
      {item.action === 'copy' && (
        <div className="absolute bottom-2 right-2 font-mono text-xs text-white/30 opacity-0 group-hover:opacity-100 transition-opacity">
          Click to copy
        </div>
      )}
    </a>
  )
}
