'use client'

import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Image, Shuffle, Terminal } from 'lucide-react'
import { useState } from 'react'

export function LeftSidebar() {
  const { selectedSubjectId, selectedChapterId, setSelectedSubjectId, setSelectedChapterId, setViewMode } = useAppStore()
  const [newSubject, setNewSubject] = useState('')
  const [newChapter, setNewChapter] = useState('')

  const { data: subjects, refetch } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => fetch('/api/subjects').then(r => r.json()),
  })

  const createSubject = async () => {
    if (!newSubject.trim()) return
    await fetch('/api/subjects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newSubject }) })
    setNewSubject('')
    refetch()
  }

  const createChapter = async () => {
    if (!newChapter.trim() || !selectedSubjectId) return
    await fetch('/api/chapters', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subjectId: selectedSubjectId, title: newChapter }) })
    setNewChapter('')
    refetch()
  }

  const selSub = subjects?.find((s: { id: number }) => s.id === selectedSubjectId) as { chapters?: { id: number; title: string }[] } | undefined

  return (
    <div className="h-full bg-slate-50 border-r flex flex-col" style={{ width: 190, minWidth: 160, maxWidth: 320, resize: 'horizontal', overflow: 'auto' }}>
      <div className="p-3 border-b">
        <h2 className="text-xs font-semibold text-slate-500 uppercase mb-2">学科分类</h2>
        {subjects?.map((s: { id: number; name: string; knowledgeCount: number }) => (
          <div key={s.id} onClick={() => { setSelectedSubjectId(s.id); setSelectedChapterId(null) }}
            className={`text-sm px-2 py-1.5 rounded cursor-pointer mb-0.5 ${selectedSubjectId === s.id ? 'bg-slate-200 font-medium' : 'hover:bg-slate-100'}`}>
            <div className="truncate">{s.name}</div>
            <div className="text-[10px] text-slate-400">{s.knowledgeCount} 知识点</div>
          </div>
        ))}
        <div className="flex gap-1 mt-2">
          <Input placeholder="新建学科" value={newSubject} onChange={e => setNewSubject(e.target.value)} onKeyDown={e => e.key === 'Enter' && createSubject()} className="text-xs h-7" />
        </div>
      </div>
      {selectedSubjectId && (
        <div className="p-3 border-b flex-1 overflow-auto">
          <h2 className="text-xs font-semibold text-slate-500 uppercase mb-2">章节</h2>
          {selSub?.chapters?.map((c: { id: number; title: string }) => (
            <div key={c.id} onClick={() => setSelectedChapterId(c.id)}
              className={`text-sm px-2 py-1 rounded cursor-pointer mb-0.5 ${selectedChapterId === c.id ? 'bg-slate-200 font-medium' : 'hover:bg-slate-100'}`}>
              {c.title}
            </div>
          ))}
          <div className="flex gap-1 mt-2">
            <Input placeholder="新建章节" value={newChapter} onChange={e => setNewChapter(e.target.value)} onKeyDown={e => e.key === 'Enter' && createChapter()} className="text-xs h-7" />
          </div>
        </div>
      )}
      <div className="p-3">
        <h2 className="text-xs font-semibold text-slate-500 uppercase mb-2">快捷入口</h2>
        <Button variant="outline" size="sm" className="w-full justify-start text-xs mb-1" onClick={() => setViewMode('quiz')}>
          <Shuffle className="w-3 h-3 mr-1" /> 随机刷题
        </Button>
        <Button variant="outline" size="sm" className="w-full justify-start text-xs mb-1" onClick={() => useAppStore.getState().setShowOcrPanel(true)}>
          <Image className="w-3 h-3 mr-1" /> 截图导入
        </Button>
        <Button variant="outline" size="sm" className="w-full justify-start text-xs" onClick={() => useAppStore.getState().toggleTerminal()}>
          <Terminal className="w-3 h-3 mr-1" /> 终端
        </Button>
      </div>
    </div>
  )
}
