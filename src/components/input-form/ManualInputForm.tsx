'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Plus, Trash2, Save } from 'lucide-react'

interface DistinctionItem {
  title: string
  content: string
}

interface FormulaItem {
  name: string
  formula: string
}

export function ManualInputForm() {
  const { selectedChapterId } = useAppStore()
  const queryClient = useQueryClient()

  const [name, setName] = useState('')
  const [mnemonic, setMnemonic] = useState('')
  const [detail, setDetail] = useState('')
  const [distinctions, setDistinctions] = useState<DistinctionItem[]>([{ title: '', content: '' }])
  const [formulas, setFormulas] = useState<FormulaItem[]>([{ name: '', formula: '' }])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addDistinction = () => {
    setDistinctions(prev => [...prev, { title: '', content: '' }])
  }

  const removeDistinction = (index: number) => {
    setDistinctions(prev => prev.filter((_, i) => i !== index))
  }

  const updateDistinction = (index: number, field: keyof DistinctionItem, value: string) => {
    setDistinctions(prev => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  const addFormula = () => {
    setFormulas(prev => [...prev, { name: '', formula: '' }])
  }

  const removeFormula = (index: number) => {
    setFormulas(prev => prev.filter((_, i) => i !== index))
  }

  const updateFormula = (index: number, field: keyof FormulaItem, value: string) => {
    setFormulas(prev => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  const resetForm = () => {
    setName('')
    setMnemonic('')
    setDetail('')
    setDistinctions([{ title: '', content: '' }])
    setFormulas([{ name: '', formula: '' }])
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('请输入知识点名称')
      return
    }
    if (!selectedChapterId) {
      toast.error('请先选择一个章节')
      return
    }

    setIsSubmitting(true)
    try {
      const body = {
        chapterId: selectedChapterId,
        name: name.trim(),
        mnemonic: mnemonic.trim() || undefined,
        detail: detail.trim() || undefined,
        distinctions: distinctions.filter(d => d.title.trim() || d.content.trim()),
        formulas: formulas.filter(f => f.name.trim() || f.formula.trim()),
      }

      const res = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || '保存失败')
      }

      toast.success('知识点保存成功')
      queryClient.invalidateQueries({ queryKey: ['knowledge'] })
      resetForm()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '保存失败，请重试'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-lg">手动录入知识点</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Name */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">
            名称 <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="知识点名称"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        {/* Mnemonic */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">记忆口诀</label>
          <Input
            placeholder="例如: 三长一短选最短"
            value={mnemonic}
            onChange={e => setMnemonic(e.target.value)}
          />
        </div>

        {/* Detail */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">详细说明</label>
          <Textarea
            placeholder="知识点详细内容..."
            value={detail}
            onChange={e => setDetail(e.target.value)}
            rows={4}
          />
        </div>

        {/* Distinctions */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-700">辨析</label>
            <Button variant="ghost" size="sm" onClick={addDistinction} className="text-xs h-7">
              <Plus className="w-3 h-3 mr-1" /> 添加
            </Button>
          </div>
          <div className="space-y-2">
            {distinctions.map((d, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1 space-y-1">
                  <Input
                    placeholder="标题"
                    value={d.title}
                    onChange={e => updateDistinction(i, 'title', e.target.value)}
                    className="text-sm h-8"
                  />
                  <Input
                    placeholder="内容"
                    value={d.content}
                    onChange={e => updateDistinction(i, 'content', e.target.value)}
                    className="text-sm h-8"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-400 hover:text-red-600 shrink-0 mt-0.5"
                  onClick={() => removeDistinction(i)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Formulas */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-700">公式</label>
            <Button variant="ghost" size="sm" onClick={addFormula} className="text-xs h-7">
              <Plus className="w-3 h-3 mr-1" /> 添加
            </Button>
          </div>
          <div className="space-y-2">
            {formulas.map((f, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1 space-y-1">
                  <Input
                    placeholder="公式名称"
                    value={f.name}
                    onChange={e => updateFormula(i, 'name', e.target.value)}
                    className="text-sm h-8"
                  />
                  <Input
                    placeholder="公式内容"
                    value={f.formula}
                    onChange={e => updateFormula(i, 'formula', e.target.value)}
                    className="text-sm h-8 font-mono"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-400 hover:text-red-600 shrink-0 mt-0.5"
                  onClick={() => removeFormula(i)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
          <Save className="w-4 h-4 mr-1" />
          {isSubmitting ? '保存中...' : '保存知识点'}
        </Button>
      </CardContent>
    </Card>
  )
}
