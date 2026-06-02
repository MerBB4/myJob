'use client'

import { useAppStore } from '@/lib/store'
import dynamic from 'next/dynamic'

const KnowledgeGraph = dynamic(() => import('@/components/knowledge-graph/KnowledgeGraph').then(m => ({ default: m.KnowledgeGraph })), { ssr: false })
const OcrPanel = dynamic(() => import('@/components/ocr-panel/OcrPanel').then(m => ({ default: m.OcrPanel })), { ssr: false })

export function MainContent() {
  const { viewMode, showOcrPanel } = useAppStore()

  if (showOcrPanel) {
    return (
      <div className="flex-1 h-full overflow-auto">
        <OcrPanel />
      </div>
    )
  }

  return (
    <div className="flex-1 h-full overflow-auto">
      {viewMode === 'graph' && <KnowledgeGraph />}
      {viewMode === 'list' && <div className="flex items-center justify-center h-full text-slate-400">列表模式（后续实现）</div>}
      {viewMode === 'quiz' && <div className="flex items-center justify-center h-full text-slate-400">刷题模式（后续实现）</div>}
    </div>
  )
}
