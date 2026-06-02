'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Image as ImageIcon, Terminal, Plus, Shuffle, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function TopBar() {
  const {
    selectedSubjectId, setSelectedSubjectId,
    viewMode, setViewMode,
    toggleTerminal, showTerminal,
    setShowOcrPanel,
  } = useAppStore()
  const [newSubject, setNewSubject] = useState('')
  const queryClient = useQueryClient()

  const { data: subjects, refetch } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => fetch('/api/subjects').then(r => r.json()),
  })

  const createSubject = async () => {
    if (!newSubject.trim()) return
    await fetch('/api/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newSubject }),
    })
    setNewSubject('')
    refetch()
  }

  const deleteSubject = async (id: number, name: string) => {
    if (!window.confirm(`确定删除学科"${name}"？\n将同时删除该学科下的所有章节、知识点、考点和真题。`)) return
    try {
      const res = await fetch(`/api/subjects/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('学科已删除')
      if (selectedSubjectId === id) setSelectedSubjectId(null)
      refetch()
      queryClient.invalidateQueries({ queryKey: ['knowledge'] })
    } catch {
      toast.error('删除学科失败')
    }
  }

  return (
    <header className="h-[48px] bg-surface-low border-b flex items-center justify-between px-4 shrink-0 select-none">
      {/* Left: subjects */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {subjects?.map((s: { id: number; name: string }) => (
          <div key={s.id} className="group relative">
            <button
              onClick={() => setSelectedSubjectId(s.id)}
              className={`px-3 py-1 rounded-full text-sm transition-colors whitespace-nowrap interactive-pill ${
                selectedSubjectId === s.id
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-high'
              }`}
            >
              {s.name}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); deleteSubject(s.id, s.name) }}
              className={`absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${
                selectedSubjectId === s.id ? 'bg-white text-red-500' : ''
              }`}
              title="删除学科"
            >
              <Trash2 className="w-2.5 h-2.5" />
            </button>
          </div>
        ))}

        <Dialog>
          <DialogTrigger className="px-2 py-1 text-on-surface-variant hover:text-on-surface transition-colors">
            <Plus className="w-3.5 h-3.5" />
          </DialogTrigger>
          <DialogContent className="w-80">
            <DialogHeader>
              <DialogTitle className="text-sm">新建学科</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="学科名称"
              value={newSubject}
              onChange={e => setNewSubject(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createSubject()}
              className="text-sm h-9"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Right: view + actions */}
      <div className="flex items-center gap-1">
        <div className="flex bg-surface-high rounded-lg p-0.5 mr-2">
          {(['graph', 'list', 'quiz'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                viewMode === mode
                  ? 'bg-white text-on-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {mode === 'graph' ? '图谱' : mode === 'list' ? '列表' : '刷题'}
            </button>
          ))}
        </div>

        <Button
          variant="ghost" size="sm"
          className="text-xs text-on-surface-variant hover:text-on-surface h-8 gap-1.5"
          onClick={() => setShowOcrPanel(true)}
        >
          <ImageIcon className="w-3.5 h-3.5" /> 截图
        </Button>
        <Button
          variant="ghost" size="sm"
          className="text-xs text-on-surface-variant hover:text-on-surface h-8 gap-1.5"
          onClick={() => setViewMode('quiz')}
        >
          <Shuffle className="w-3.5 h-3.5" /> 刷题
        </Button>
        <Button
          variant="ghost" size="sm"
          className={`text-xs h-8 gap-1.5 ${showTerminal ? 'text-accent' : 'text-on-surface-variant hover:text-on-surface'}`}
          onClick={toggleTerminal}
        >
          <Terminal className="w-3.5 h-3.5" /> 终端
        </Button>
      </div>
    </header>
  )
}
