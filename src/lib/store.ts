import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ViewMode = 'graph' | 'list' | 'quiz'

interface AppState {
  selectedSubjectId: number | null
  setSelectedSubjectId: (id: number | null) => void

  selectedChapterId: number | null
  setSelectedChapterId: (id: number | null) => void

  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void

  showTerminal: boolean
  toggleTerminal: () => void

  showOcrPanel: boolean
  setShowOcrPanel: (show: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedSubjectId: null,
      setSelectedSubjectId: (id) => set({ selectedSubjectId: id }),

      selectedChapterId: null,
      setSelectedChapterId: (id) => set({ selectedChapterId: id }),

      viewMode: 'graph',
      setViewMode: (mode) => set({ viewMode: mode }),

      showTerminal: false,
      toggleTerminal: () => set((s) => ({ showTerminal: !s.showTerminal })),

      showOcrPanel: false,
      setShowOcrPanel: (show) => set({ showOcrPanel: show }),
    }),
    {
      name: 'exam-note-ui-state',
      partialize: (state) => ({
        selectedSubjectId: state.selectedSubjectId,
        viewMode: state.viewMode,
      }),
    }
  )
)
