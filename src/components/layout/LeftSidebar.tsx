'use client'

import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus } from 'lucide-react'
import { useState } from 'react'

export function LeftSidebar() {
  const { selectedSubjectId, selectedChapterId, setSelectedChapterId } = useAppStore()
  const [newChapter, setNewChapter] = useState('')

  const { data: subjects, refetch } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => fetch('/api/subjects').then(r => r.json()),
  })

  const selSub = subjects?.find((s: { id: number }) => s.id === selectedSubjectId) as {
    name?: string; chapters?: { id: number; title: string }[]
  } | undefined

  const createChapter = async () => {
    if (!newChapter.trim() || !selectedSubjectId) return
    await fetch('/api/chapters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subjectId: selectedSubjectId, title: newChapter }),
    })
    setNewChapter('')
    refetch()
  }

  if (!selectedSubjectId) {
    return (
      <div className="flex flex-col border-r bg-surface-low" style={{ width: 220, minWidth: 180, maxWidth: 320, resize: 'horizontal', overflow: 'auto' }}>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-on-surface-variant px-4 text-center">
            请在上方导航栏选择一个学科
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col border-r bg-surface-low" style={{ width: 220, minWidth: 180, maxWidth: 320, resize: 'horizontal', overflow: 'auto' }}>
      {/* Header */}
      <div className="px-4 py-3 border-b">
        <h2 className="text-sm font-semibold text-on-surface truncate">{selSub?.name || '章节'}</h2>
        <p className="text-xs text-on-surface-variant mt-0.5">章节列表</p>
      </div>

      {/* Chapter list */}
      <div className="flex-1 overflow-auto py-1">
        {selSub?.chapters?.map((c: { id: number; title: string }) => (
          <button
            key={c.id}
            onClick={() => setSelectedChapterId(c.id)}
            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
              selectedChapterId === c.id
                ? 'bg-surface-high text-on-surface font-medium'
                : 'text-on-surface-variant hover:bg-surface-high/50 hover:text-on-surface'
            }`}
          >
            {c.title}
          </button>
        ))}
        {(!selSub?.chapters || selSub.chapters.length === 0) && (
          <p className="px-4 py-8 text-xs text-on-surface-variant text-center">暂无章节</p>
        )}
      </div>

      {/* New chapter input */}
      <div className="p-3 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="新建章节"
            value={newChapter}
            onChange={e => setNewChapter(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createChapter()}
            className="text-sm h-8"
          />
          <Button size="icon" className="h-8 w-8 shrink-0" onClick={createChapter} disabled={!newChapter.trim()}>
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
