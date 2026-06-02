import { create } from 'zustand'

export type ViewMode = 'graph' | 'list' | 'quiz'
export type RightPanelMode = 'ai' | 'terminal'

interface AppState {
  selectedSubjectId: number | null
  setSelectedSubjectId: (id: number | null) => void

  selectedChapterId: number | null
  setSelectedChapterId: (id: number | null) => void

  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void

  rightPanelMode: RightPanelMode
  setRightPanelMode: (mode: RightPanelMode) => void

  showOcrPanel: boolean
  setShowOcrPanel: (show: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  selectedSubjectId: null,
  setSelectedSubjectId: (id) => set({ selectedSubjectId: id }),

  selectedChapterId: null,
  setSelectedChapterId: (id) => set({ selectedChapterId: id }),

  viewMode: 'graph',
  setViewMode: (mode) => set({ viewMode: mode }),

  rightPanelMode: 'ai',
  setRightPanelMode: (mode) => set({ rightPanelMode: mode }),

  showOcrPanel: false,
  setShowOcrPanel: (show) => set({ showOcrPanel: show }),
}))
