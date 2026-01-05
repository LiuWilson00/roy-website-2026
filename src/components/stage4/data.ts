/**
 * Stage 4 - Contact 資料配置
 * 從 resume.json 載入聯絡資料
 */

import type { ContactItem } from './types'
import { getContact } from '../../data/resume'

/**
 * 取得聯絡資料
 */
export function getContactData(): ContactItem[] {
  const contact = getContact()

  const items: ContactItem[] = [
    {
      id: 'email',
      type: 'email',
      title: 'EMAIL',
      subtitle: contact.email,
      href: `mailto:${contact.email}`,
      action: 'copy',
    },
    {
      id: 'github',
      type: 'github',
      title: 'GITHUB',
      subtitle: contact.github.replace('https://github.com/', ''),
      href: contact.github,
      action: 'link',
    },
    {
      id: 'linkedin',
      type: 'linkedin',
      title: 'LINKEDIN',
      subtitle: 'Wei Liu',
      href: contact.linkedin,
      action: 'link',
    },
  ]

  // 如果有 CakeResume 則加入
  if (contact.cake) {
    items.push({
      id: 'cake',
      type: 'website', // 使用 website type 作為通用
      title: 'CAKE',
      subtitle: 'CakeResume',
      href: contact.cake,
      action: 'link',
    })
  }

  return items
}

// 保留向後相容的靜態資料匯出
export const contactItems = getContactData()
