/**
 * Stage 4 - Contact 資料配置
 * 請根據實際資料修改
 */

import type { ContactItem } from './types'

export const contactItems: ContactItem[] = [
  {
    id: 'email',
    type: 'email',
    title: 'EMAIL',
    subtitle: 'your.email@example.com',
    href: 'mailto:your.email@example.com',
    action: 'copy',
  },
  {
    id: 'github',
    type: 'github',
    title: 'GITHUB',
    subtitle: 'github.com/username',
    href: 'https://github.com/username',
    action: 'link',
  },
  {
    id: 'linkedin',
    type: 'linkedin',
    title: 'LINKEDIN',
    subtitle: 'linkedin.com/in/username',
    href: 'https://linkedin.com/in/username',
    action: 'link',
  },
  {
    id: 'resume',
    type: 'resume',
    title: 'RESUME',
    subtitle: 'Download PDF',
    href: '/resume.pdf',
    action: 'download',
  },
]
