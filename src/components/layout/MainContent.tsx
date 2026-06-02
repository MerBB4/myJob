'use client'

import { useAppStore } from '@/lib/store'
import dynamic from 'next/dynamic'

const KnowledgeGraph = dynamic(() => import('@/components/knowledge-graph/KnowledgeGraph').then(m => ({ default: m.KnowledgeGraph })), { ssr: false })
const OcrPanel = dynamic(() => import('@/components/ocr-panel/OcrPanel').then(m => ({ default: m.OcrPanel })), { ssr: false })

export function MainContent() {
  const { viewMode, showOcrPanel } = useAppStore()

  return (
    <div className="flex-1 h-full overflow-auto relative">
      {viewMode === 'graph' && <KnowledgeGraph />}
      {viewMode === 'list' && (
        <div className="flex items-center justify-center h-full text-on-surface-variant animate-fade-in">
          列表模式（后续实现）
        </div>
      )}
      {viewMode === 'quiz' && (
        <div className="flex items-center justify-center h-full text-on-surface-variant animate-fade-in">
          刷题模式（后续实现）
        </div>
      )}

      {/* OCR overlay — covers main content when active */}
      {showOcrPanel && (
        <div className="absolute inset-0 z-[var(--z-overlay)] bg-surface animate-slide-up">
          <OcrPanel />
        </div>
      )}
    </div>
  )
}
