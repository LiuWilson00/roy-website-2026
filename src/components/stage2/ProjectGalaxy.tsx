/**
 * ProjectGalaxy - 專案星系容器
 * 管理分頁狀態、星球顯示和選中邏輯
 */

import { useState, useMemo, useCallback, useEffect } from 'react'
import type { Project } from './types'
import { PLANETS_PER_PAGE, PLANET_POSITIONS, PLANET_POSITIONS_MOBILE } from './types'
import ProjectPlanet from './ProjectPlanet'
import ProjectCard from './ProjectCard'
import GalaxyNav from './GalaxyNav'
import { useIsMobile } from '../../hooks/useIsMobile'

interface ProjectGalaxyProps {
  projects: Project[]
  animate?: boolean
}

export default function ProjectGalaxy({
  projects,
  animate = true,
}: ProjectGalaxyProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [pageKey, setPageKey] = useState(0) // 用於強制重新渲染動畫

  // 檢測手機版
  const isMobile = useIsMobile()

  // 根據裝置選擇位置配置
  const positions = isMobile ? PLANET_POSITIONS_MOBILE : PLANET_POSITIONS

  // 計算總頁數
  const totalPages = Math.ceil(projects.length / PLANETS_PER_PAGE)

  // 當前頁的專案
  const currentProjects = useMemo(() => {
    const start = currentPage * PLANETS_PER_PAGE
    return projects.slice(start, start + PLANETS_PER_PAGE)
  }, [currentPage, projects])

  // 找到選中的專案和位置
  const selectedProject = useMemo(() => {
    if (!selectedId) return null
    const index = currentProjects.findIndex((p) => p.id === selectedId)
    if (index === -1) return null
    return {
      project: currentProjects[index],
      position: positions[index],
    }
  }, [selectedId, currentProjects, positions])

  // 頁面切換
  const goToPage = useCallback((page: number) => {
    if (isTransitioning || page === currentPage) return
    if (page < 0 || page >= totalPages) return

    setIsTransitioning(true)
    setSelectedId(null) // 關閉卡片

    // 簡單延遲切換（動畫由組件自己處理）
    setTimeout(() => {
      setCurrentPage(page)
      setPageKey((prev) => prev + 1) // 強制重新渲染觸發動畫
      setIsTransitioning(false)
    }, 300)
  }, [currentPage, isTransitioning, totalPages])

  // 鍵盤導航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPage(currentPage - 1)
      } else if (e.key === 'ArrowRight') {
        goToPage(currentPage + 1)
      } else if (e.key === 'Escape') {
        setSelectedId(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentPage, goToPage])

  // 處理星球點擊
  const handlePlanetClick = (projectId: string) => {
    if (isTransitioning) return
    setSelectedId(selectedId === projectId ? null : projectId)
  }

  // 關閉卡片
  const handleCloseCard = () => {
    setSelectedId(null)
  }

  return (
    <div className="absolute inset-0">
      {/* 星球區域 */}
      <div
        className="absolute inset-0 pointer-events-auto"
        style={{
          opacity: isTransitioning ? 0.5 : 1,
          transition: 'opacity 0.3s',
        }}
      >
        {currentProjects.map((project, index) => {
          const position = positions[index]
          if (!position) return null

          return (
            <ProjectPlanet
              key={`${pageKey}-${project.id}`}
              project={project}
              size={position.size}
              positionX={position.x}
              positionY={position.y}
              isSelected={selectedId === project.id}
              onClick={() => handlePlanetClick(project.id)}
              delay={animate ? 0.1 + index * 0.15 : 0}
              isMobile={isMobile}
            />
          )
        })}
      </div>

      {/* 專案卡片 */}
      {selectedProject && (
        <ProjectCard
          project={selectedProject.project}
          planetPosition={{
            x: selectedProject.position.x,
            y: selectedProject.position.y,
          }}
          onClose={handleCloseCard}
        />
      )}

      {/* 導航控制 - 使用 fixed 定位 */}
      {totalPages > 1 && (
        <GalaxyNav
          currentPage={currentPage}
          totalPages={totalPages}
          onPrev={() => goToPage(currentPage - 1)}
          onNext={() => goToPage(currentPage + 1)}
          onGoToPage={goToPage}
          disabled={isTransitioning}
        />
      )}
    </div>
  )
}
