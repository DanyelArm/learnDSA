import { useRef, useCallback, useEffect } from 'react'
import { useUIStore } from '@/stores/uiStore'
import { WORLD_WIDTH, WORLD_HEIGHT } from '@/lib/constants'

const MAX_SCALE = 2.0

function getMinScale(container: HTMLElement): number {
  const rect = container.getBoundingClientRect()
  return Math.max(rect.width / WORLD_WIDTH, rect.height / WORLD_HEIGHT)
}

export function useMapTransform(containerRef: React.RefObject<HTMLDivElement | null>) {
  const { mapTransform, setMapTransform } = useUIStore()
  const isDragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })
  const transformRef = useRef(mapTransform)

  useEffect(() => {
    transformRef.current = mapTransform
  }, [mapTransform])

  function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value))
  }

  function clampTranslation(x: number, y: number, scale: number, container: HTMLElement) {
    const rect = container.getBoundingClientRect()
    const scaledW = WORLD_WIDTH * scale
    const scaledH = WORLD_HEIGHT * scale

    const minX = Math.min(0, rect.width - scaledW)
    const minY = Math.min(0, rect.height - scaledH)

    return {
      x: clamp(x, minX, 0),
      y: clamp(y, minY, 0),
    }
  }

  const onWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault()
      const container = containerRef.current
      if (!container) return

      const { x, y, scale } = transformRef.current
      const newScale = clamp(scale * (1 - e.deltaY * 0.001), getMinScale(container), MAX_SCALE)
      const factor = newScale / scale

      // Zoom toward cursor position
      const rect = container.getBoundingClientRect()
      const cursorX = e.clientX - rect.left
      const cursorY = e.clientY - rect.top
      const newX = cursorX - factor * (cursorX - x)
      const newY = cursorY - factor * (cursorY - y)

      const clamped = clampTranslation(newX, newY, newScale, container)
      const next = { x: clamped.x, y: clamped.y, scale: newScale }
      transformRef.current = next
      setMapTransform(next)
    },
    [containerRef, setMapTransform],
  )

  const onMouseDown = useCallback((e: MouseEvent) => {
    if (e.button !== 0) return
    isDragging.current = true
    lastPos.current = { x: e.clientX, y: e.clientY }
    document.body.style.cursor = 'grabbing'
    document.body.style.userSelect = 'none'
  }, [])

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging.current) return
      const container = containerRef.current
      if (!container) return

      const dx = e.clientX - lastPos.current.x
      const dy = e.clientY - lastPos.current.y
      lastPos.current = { x: e.clientX, y: e.clientY }

      const { x, y, scale } = transformRef.current
      const clamped = clampTranslation(x + dx, y + dy, scale, container)
      const next = { ...clamped, scale }
      transformRef.current = next
      setMapTransform(next)
    },
    [containerRef, setMapTransform],
  )

  const onMouseUp = useCallback(() => {
    isDragging.current = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('wheel', onWheel, { passive: false })
    container.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    return () => {
      container.removeEventListener('wheel', onWheel)
      container.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [containerRef, onWheel, onMouseDown, onMouseMove, onMouseUp])

  return mapTransform
}
