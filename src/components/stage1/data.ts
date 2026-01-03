/**
 * Stage 1 - Profile Data
 * 個人經歷與技能資料
 */

import type { TimelineEntry, SkillCategory } from './types'

// Timeline 經歷資料（由新到舊排序）
export const timelineData: TimelineEntry[] = [
  {
    id: 'exp-1',
    year: 2020,
    title: 'Senior Engineer',
    organization: 'TechCorp',
    description: 'Senior Engineer role and managed operations, code development with cutting-edge technologies.',
    type: 'work',
  },
  {
    id: 'exp-2',
    year: 2018,
    title: 'Full Stack Dev',
    organization: 'StartupX',
    description: 'Full Stack dev roles and handled operations, code development and clients.',
    type: 'work',
  },
  {
    id: 'exp-3',
    year: 2015,
    title: 'CS Degree Completed',
    organization: 'University',
    description: 'Computer Science degree completion, top-grades academic achievement.',
    type: 'education',
  },
  {
    id: 'exp-4',
    year: 2014,
    title: 'Junior Developer',
    organization: 'LocalTech',
    description: 'Started coding journey, learned fundamentals and best practices.',
    type: 'work',
  },
  {
    id: 'exp-5',
    year: 2012,
    title: 'First Hackathon',
    organization: 'TechConf',
    description: 'Won first place in regional hackathon with innovative solution.',
    type: 'achievement',
  },
]

// Skill 技能資料
export const skillData: SkillCategory[] = [
  {
    id: 'frontend',
    name: 'FRONTEND ARSENAL',
    skills: ['React', 'Next.js', 'TS', 'Tailwind', 'GSAP'],
    proficiency: 95,
    color: 'cyan',
  },
  {
    id: 'backend',
    name: 'BACKEND & DATA',
    skills: ['Node.js', 'Python', 'PostgreSQL', 'GraphQL', 'Redis'],
    proficiency: 90,
    color: 'magenta',
  },
  {
    id: 'devops',
    name: 'DEVOPS & TOOLS',
    skills: ['Git', 'Docker', 'AWS', 'CI/CD', 'Figma'],
    proficiency: 85,
    color: 'blue',
  },
]
