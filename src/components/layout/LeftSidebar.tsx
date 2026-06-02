'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export function LeftSidebar() {
  const { selectedSubjectId, selectedChapterId, setSelectedChapterId } = useAppStore()
  const [newChapter, setNewChapter] = useState('')
  const queryClient = useQueryClient()

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

  const deleteChapter = async (id: number, title: string) => {
    if (!window.confirm(`确定删除章节"${title}"？\n将同时删除该章节下的所有知识点、考点和真题。`)) return
    try {
      const res = await fetch(`/api/chapters/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('章节已删除')
      if (selectedChapterId === id) setSelectedChapterId(null)
      refetch()
      queryClient.invalidateQueries({ queryKey: ['knowledge'] })
    } catch {
      toast.error('删除章节失败')
    }
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
          <div key={c.id} className="group relative">
            <button
              onClick={() => setSelectedChapterId(c.id)}
              className={`w-full text-left px-4 py-2 pr-8 text-sm transition-colors interactive-list-item ${
                selectedChapterId === c.id
                  ? 'bg-surface-high text-on-surface font-medium'
                  : 'text-on-surface-variant hover:bg-surface-high/50 hover:text-on-surface'
              }`}
            >
              {c.title}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); deleteChapter(c.id, c.title) }}
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-500 text-on-surface-variant"
              title="删除章节"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
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
