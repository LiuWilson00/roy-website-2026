/**
 * Stage 2 - Project Galaxy 範例資料
 */

import type { Project } from './types'

// 生成 picsum 圖片 URL
const getProjectImage = (seed: string, width = 400, height = 300) => {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`
}

export const projectData: Project[] = [
  {
    id: 'nebula-explorer',
    name: 'Nebula Explorer',
    description: 'A 3D interactive space visualization tool built with Three.js and WebGL.',
    thumbnail: getProjectImage('nebula', 400, 300),
    tags: ['Three.js', 'WebGL', 'React'],
    link: 'https://example.com/nebula',
    glowColor: 'cyan',
  },
  {
    id: 'data-forge',
    name: 'Data Forge',
    description: 'Real-time data analytics dashboard with advanced visualization.',
    thumbnail: getProjectImage('dataforge', 400, 300),
    tags: ['D3.js', 'Node.js', 'PostgreSQL'],
    link: 'https://example.com/dataforge',
    glowColor: 'purple',
  },
  {
    id: 'code-stream',
    name: 'Code Stream',
    description: 'Live code collaboration platform with real-time sync.',
    thumbnail: getProjectImage('codestream', 400, 300),
    tags: ['Socket.io', 'Monaco Editor', 'Redis'],
    glowColor: 'blue',
  },
  {
    id: 'ai-assistant',
    name: 'AI Assistant',
    description: 'Intelligent chatbot powered by machine learning.',
    thumbnail: getProjectImage('aibot', 400, 300),
    tags: ['Python', 'TensorFlow', 'FastAPI'],
    glowColor: 'pink',
  },
  {
    id: 'cloud-sync',
    name: 'Cloud Sync',
    description: 'Cross-platform file synchronization service.',
    thumbnail: getProjectImage('cloudsync', 400, 300),
    tags: ['AWS', 'Go', 'React Native'],
    glowColor: 'green',
  },
  {
    id: 'design-system',
    name: 'Design System',
    description: 'Comprehensive UI component library for enterprise apps.',
    thumbnail: getProjectImage('designsys', 400, 300),
    tags: ['Storybook', 'Figma', 'TypeScript'],
    glowColor: 'orange',
  },
  {
    id: 'quantum-sim',
    name: 'Quantum Sim',
    description: 'Quantum computing simulator for educational purposes.',
    thumbnail: getProjectImage('quantum', 400, 300),
    tags: ['Rust', 'WASM', 'React'],
    glowColor: 'yellow',
  },
  {
    id: 'eco-tracker',
    name: 'Eco Tracker',
    description: 'Carbon footprint tracking app with gamification.',
    thumbnail: getProjectImage('ecotrack', 400, 300),
    tags: ['Flutter', 'Firebase', 'ML Kit'],
    glowColor: 'green',
  },
  {
    id: 'music-gen',
    name: 'Music Gen',
    description: 'AI-powered music generation and composition tool.',
    thumbnail: getProjectImage('musicgen', 400, 300),
    tags: ['PyTorch', 'Web Audio', 'Next.js'],
    glowColor: 'purple',
  },
]
