'use client'

import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { KnowledgeCard } from '@/components/knowledge-graph/KnowledgeCard'
import { KnowledgeDetail } from '@/components/knowledge-graph/KnowledgeDetail'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import type { KnowledgeNode } from '@/lib/types'
import { useState } from 'react'

export function KnowledgeGraph() {
  const { selectedSubjectId, selectedChapterId } = useAppStore()
  const [selectedKnowledge, setSelectedKnowledge] = useState<KnowledgeNode | null>(null)

  const { data: knowledgeList, isLoading } = useQuery<KnowledgeNode[]>({
    queryKey: ['knowledge', selectedChapterId, selectedSubjectId],
    queryFn: async () => {
      const url = selectedChapterId
        ? `/api/knowledge?chapterId=${selectedChapterId}`
        : selectedSubjectId
          ? `/api/knowledge?subjectId=${selectedSubjectId}`
          : '/api/knowledge'
      const res = await fetch(url)
      return res.json()
    },
    enabled: !!selectedSubjectId || !!selectedChapterId,
  })

  if (!selectedSubjectId && !selectedChapterId) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        <p>请从左侧选择一个学科或章节</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-3/4" />
        <Skeleton className="h-32 w-2/3" />
      </div>
    )
  }

  if (!knowledgeList || knowledgeList.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        <p>暂无知识点，请先创建</p>
      </div>
    )
  }

  return (
    <div className="flex h-full relative">
      <ScrollArea className="flex-1 h-full">
        <div className="p-6 space-y-4">
          {knowledgeList.map((k) => (
            <KnowledgeCard
              key={k.id}
              knowledge={k}
              onClick={() => setSelectedKnowledge(k)}
            />
          ))}
        </div>
      </ScrollArea>
      {selectedKnowledge && (
        <KnowledgeDetail
          knowledge={selectedKnowledge}
          onClose={() => setSelectedKnowledge(null)}
        />
      )}
    </div>
  )
}
