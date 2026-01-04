/**
 * FlyingObjects - 飛行物彩蛋
 * 定時在畫面角落飛過的飛碟和火箭
 */

import { useState, useEffect, useCallback } from 'react'
import './FlyingObjects.css'

type ObjectType = 'ufo' | 'rocket'
type Direction = 'left-to-right' | 'right-to-left'

interface FlyingObject {
  id: number
  type: ObjectType
  direction: Direction
}

// 隨機間隔時間（40-80秒）
const getRandomInterval = () => Math.random() * 40000 + 40000

export default function FlyingObjects() {
  const [objects, setObjects] = useState<FlyingObject[]>([])
  const [nextId, setNextId] = useState(0)

  // 生成新的飛行物
  const spawnObject = useCallback(() => {
    const type: ObjectType = Math.random() > 0.5 ? 'ufo' : 'rocket'
    const direction: Direction = Math.random() > 0.5 ? 'left-to-right' : 'right-to-left'

    const newObject: FlyingObject = {
      id: nextId,
      type,
      direction,
    }

    setObjects(prev => [...prev, newObject])
    setNextId(prev => prev + 1)

    // 動畫結束後移除（8秒後）
    setTimeout(() => {
      setObjects(prev => prev.filter(obj => obj.id !== newObject.id))
    }, 8000)
  }, [nextId])

  // 定時生成飛行物
  useEffect(() => {
    // 首次延遲 15-30 秒後出現
    const initialDelay = Math.random() * 15000 + 15000

    const scheduleNext = () => {
      const interval = getRandomInterval()
      return setTimeout(() => {
        spawnObject()
        scheduleNext()
      }, interval)
    }

    const initialTimer = setTimeout(() => {
      spawnObject()
      scheduleNext()
    }, initialDelay)

    return () => clearTimeout(initialTimer)
  }, [spawnObject])

  return (
    <div className="flying-objects-container">
      {objects.map(obj => (
        <div
          key={obj.id}
          className={`flying-object ${obj.type} ${obj.direction}`}
        >
          {obj.type === 'ufo' ? <UFO /> : <Rocket direction={obj.direction} />}
        </div>
      ))}
    </div>
  )
}

// 飛碟組件
function UFO() {
  return (
    <div className="ufo-wrapper">
      {/* 光束 */}
      <div className="ufo-beam" />
      {/* 機身 */}
      <div className="ufo-body">
        <div className="ufo-dome" />
        <div className="ufo-ring">
          <div className="ufo-light" />
          <div className="ufo-light" />
          <div className="ufo-light" />
          <div className="ufo-light" />
        </div>
        <div className="ufo-bottom" />
      </div>
    </div>
  )
}

// 火箭組件
function Rocket({ direction }: { direction: Direction }) {
  return (
    <div className={`rocket-wrapper ${direction}`}>
      <div className="rocket-body">
        <div className="rocket-nose" />
        <div className="rocket-window" />
        <div className="rocket-fin rocket-fin-left" />
        <div className="rocket-fin rocket-fin-right" />
        <div className="rocket-fire">
          <div className="fire-inner" />
        </div>
      </div>
    </div>
  )
}
