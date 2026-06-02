'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Upload, X, Check, Pencil, CheckCheck, ArrowLeft } from 'lucide-react'
import type { AiCorrection } from '@/lib/types'

type Stage = 'upload' | 'review' | 'form'

interface CorrectionWithStatus extends AiCorrection {
  id: number
  accepted: boolean
}

export function OcrPanel() {
  const { setShowOcrPanel } = useAppStore()
  const [stage, setStage] = useState<Stage>('upload')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [ocrText, setOcrText] = useState('')
  const [corrections, setCorrections] = useState<CorrectionWithStatus[]>([])
  const [finalName, setFinalName] = useState('')
  const [finalContent, setFinalContent] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Paste handler
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) handleFile(file)
          break
        }
      }
    }
    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [])

  const handleFile = useCallback(async (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'OCR failed')

      const text = data.data || data.text || ''
      setOcrText(text)
      simulateAiReview(text)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'OCR识别失败'
      toast.error(message)
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const simulateAiReview = (text: string) => {
    // Demo: pattern-based AI simulation corrections
    const simCorrections: CorrectionWithStatus[] = []
    let id = 0

    // Simulate common OCR errors
    const errorPatterns: [RegExp, string, string][] = [
      [/考彡/g, '考编', '常见OCR错误: 彡→编'],
      [/公募/g, '公募', '疑似OCR错误: 募→墓/某?'],
      [/\b行侧\b/g, '行测', '常见OCR错误: 侧→测'],
      [/甲请/g, '申论', '常见OCR错误: 甲请→申论'],
    ]

    for (const [pattern, replacement, reason] of errorPatterns) {
      if (pattern.test(text)) {
        const matches = text.match(pattern)
        if (matches) {
          simCorrections.push({
            id: id++,
            field: 'ocr-error',
            original: matches[0],
            corrected: replacement,
            supplement: reason,
            accepted: false,
          })
        }
      }
    }

    // Simulate AI supplement
    if (text.length > 0 && text.length < 100) {
      simCorrections.push({
        id: id++,
        field: 'supplement',
        original: '',
        corrected: '',
        supplement: '建议补充更多详细内容和例题解析，当前文本较短',
        accepted: false,
      })
    }

    setCorrections(simCorrections)
    setStage('review')
  }

  const acceptCorrection = (id: number) => {
    setCorrections(prev => prev.map(c => (c.id === id ? { ...c, accepted: true } : c)))
  }

  const rejectCorrection = (id: number) => {
    setCorrections(prev => prev.filter(c => c.id !== id))
  }

  const editCorrection = (id: number, newCorrected: string) => {
    setCorrections(prev => prev.map(c => (c.id === id ? { ...c, corrected: newCorrected } : c)))
  }

  const acceptAll = () => {
    setCorrections(prev => prev.map(c => ({ ...c, accepted: true })))
  }

  const proceedToForm = () => {
    // Apply accepted corrections to build final content
    let processedText = ocrText
    const accepted = corrections.filter(c => c.accepted)
    const applied: string[] = []

    for (const c of accepted) {
      if (c.corrected && c.original) {
        processedText = processedText.replace(c.original, c.corrected)
        if (!applied.includes(c.supplement || '')) {
          applied.push(c.supplement || '')
        }
      }
    }

    // Extract title from first line
    const lines = processedText.split('\n').filter(Boolean)
    const title = lines[0] || ''
    const content = lines.length > 1 ? lines.slice(1).join('\n') : processedText

    // Append AI supplements as notes
    const supplementNotes = applied.filter(Boolean).map(s => `[AI建议] ${s}`).join('\n')
    setFinalName(title.length > 30 ? title.slice(0, 30) + '...' : title)
    setFinalContent(supplementNotes ? content + '\n\n' + supplementNotes : content)
    setStage('form')
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      handleFile(file)
    } else {
      toast.error('请上传图片文件')
    }
  }, [handleFile])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const saveToKnowledge = async () => {
    if (!finalName.trim()) {
      toast.error('请输入标题')
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: finalName.trim(),
          detail: finalContent.trim(),
        }),
      })
      if (!res.ok) throw new Error('保存失败')
      toast.success('知识条目保存成功')
      setShowOcrPanel(false)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '保存失败'
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  // Upload stage
  if (stage === 'upload') {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-3 border-b">
          <h2 className="font-semibold text-sm">截图导入</h2>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowOcrPanel(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div
            ref={dropRef}
            className={`w-full max-w-md border-2 border-dashed rounded-xl p-12 text-center transition-colors ${isDragging ? 'border-sky-500 bg-sky-50' : 'border-slate-300 hover:border-slate-400'}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="w-10 h-10 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 mb-1">拖放截图到此处</p>
            <p className="text-xs text-slate-400 mb-4">或使用 Ctrl+V 粘贴截图</p>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
            >
              {isProcessing ? '处理中...' : '选择文件'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  // Review stage
  if (stage === 'review') {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-3 border-b">
          <h2 className="font-semibold text-sm">AI审阅</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs h-7" onClick={acceptAll}>
              <CheckCheck className="w-3 h-3 mr-1" /> 全部接受
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowOcrPanel(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <div className="p-4 space-y-4">
            {/* Original image */}
            {imagePreview && (
              <div className="rounded-lg border overflow-hidden">
                <img src={imagePreview} alt="截图" className="w-full max-h-48 object-contain bg-slate-100" />
              </div>
            )}

            {/* OCR text with corrections */}
            <Card className="p-4">
              <h3 className="text-xs font-medium text-slate-500 mb-2">识别文本</h3>
              <div className="bg-slate-50 rounded p-3 text-sm text-slate-700 whitespace-pre-wrap max-h-48 overflow-auto">
                {ocrText}
              </div>
            </Card>

            {/* AI Corrections */}
            {corrections.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-slate-500 mb-2">
                  AI建议修改
                  <Badge variant="secondary" className="ml-1 text-[10px]">{corrections.length}</Badge>
                </h3>
                <div className="space-y-2">
                  {corrections.map((c) => (
                    <Card key={c.id} className="p-3">
                      {c.field === 'ocr-error' && c.original && (
                        <div className="space-y-1 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-red-500 line-through">{c.original}</span>
                            <span className="text-xs text-slate-300">→</span>
                            <span className="text-xs text-green-600 underline font-medium">{c.corrected}</span>
                          </div>
                          {c.supplement && (
                            <p className="text-[11px] text-slate-400">{c.supplement}</p>
                          )}
                        </div>
                      )}
                      {c.field === 'supplement' && c.supplement && (
                        <div className="mb-2">
                          <div className="border border-green-200 border-dashed rounded bg-green-50/50 p-2 text-xs text-green-700">
                            {c.supplement}
                          </div>
                        </div>
                      )}
                      <div className="flex gap-1">
                        <Button
                          variant={c.accepted ? 'default' : 'outline'}
                          size="sm"
                          className="text-xs h-6"
                          onClick={() => acceptCorrection(c.id)}
                          disabled={c.accepted}
                        >
                          <Check className="w-3 h-3 mr-1" />
                          {c.accepted ? '已接受' : '接受'}
                        </Button>
                        {!c.accepted && (
                          <>
                            <Button variant="outline" size="sm" className="text-xs h-6" onClick={() => rejectCorrection(c.id)}>
                              <X className="w-3 h-3 mr-1" /> 拒绝
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs h-6" onClick={() => {
                              const newVal = prompt('编辑修正内容:', c.corrected)
                              if (newVal !== null) editCorrection(c.id, newVal)
                            }}>
                              <Pencil className="w-3 h-3 mr-1" /> 编辑
                            </Button>
                          </>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={proceedToForm} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-1 transform rotate-180" /> 进入最终编辑
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Form stage
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setStage('review')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="font-semibold text-sm">最终编辑</h2>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowOcrPanel(false)}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">标题</label>
          <Input value={finalName} onChange={e => setFinalName(e.target.value)} placeholder="知识点标题" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">内容</label>
          <Textarea
            value={finalContent}
            onChange={e => setFinalContent(e.target.value)}
            placeholder="知识点详细内容..."
            rows={12}
          />
        </div>
        <Button onClick={saveToKnowledge} disabled={isSaving} className="w-full">
          <Save className="w-4 h-4 mr-1" />
          {isSaving ? '保存中...' : '保存到知识库'}
        </Button>
      </div>
    </div>
  )
}

function Save({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  )
}
