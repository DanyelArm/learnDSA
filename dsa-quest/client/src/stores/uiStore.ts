import { create } from 'zustand'

interface MapTransform {
  x: number
  y: number
  scale: number
}

interface UIState {
  mapTransform: MapTransform
  selectedNodeOrder: number | null
  setMapTransform: (transform: MapTransform) => void
  setSelectedNode: (order: number | null) => void
}

export const useUIStore = create<UIState>()((set) => ({
  mapTransform: { x: 0, y: 0, scale: 0.75 },
  selectedNodeOrder: null,
  setMapTransform: (mapTransform) => set({ mapTransform }),
  setSelectedNode: (selectedNodeOrder) => set({ selectedNodeOrder }),
}))
