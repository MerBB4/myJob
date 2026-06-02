'use client'

import type { KnowledgeNode } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface KnowledgeDetailProps {
  knowledge: KnowledgeNode
  onClose: () => void
}

export function KnowledgeDetail({ knowledge, onClose }: KnowledgeDetailProps) {
  const questionsCount = knowledge.examPoints?.reduce((acc, ep) => acc + (ep.examQuestions?.length ?? 0), 0) ?? 0

  return (
    <div className="w-[320px] h-full border-l bg-white overflow-hidden flex flex-col shrink-0">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-semibold text-sm truncate flex-1">{knowledge.name}</h3>
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Mnemonic */}
          {knowledge.mnemonic && (
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
              <h4 className="text-xs font-medium text-amber-700 mb-1">记忆口诀</h4>
              <p className="text-sm text-amber-800">{knowledge.mnemonic}</p>
            </div>
          )}

          {/* Detail */}
          {knowledge.detail && (
            <div>
              <h4 className="text-xs font-medium text-slate-500 mb-1">详细说明</h4>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{knowledge.detail}</p>
            </div>
          )}

          {/* Distinctions */}
          {knowledge.distinctions && knowledge.distinctions.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-slate-500 mb-2">辨析</h4>
              <div className="space-y-2">
                {knowledge.distinctions.map((d, i) => (
                  <div key={i} className="bg-slate-50 rounded p-2 text-sm">
                    <span className="font-medium text-slate-700">{d.title}:</span>{' '}
                    <span className="text-slate-600">{d.content}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formulas */}
          {knowledge.formulas && knowledge.formulas.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-slate-500 mb-2">公式</h4>
              <div className="space-y-2">
                {knowledge.formulas.map((f, i) => (
                  <div key={i} className="bg-sky-50 border border-sky-100 rounded-lg p-3">
                    <div className="text-xs text-sky-600 mb-1">{f.name}</div>
                    <div className="text-sm font-mono text-sky-900">{f.formula}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mind Map Image */}
          {knowledge.mindMap && (
            <div>
              <h4 className="text-xs font-medium text-slate-500 mb-2">思维导图</h4>
              <img
                src={knowledge.mindMap}
                alt="思维导图"
                className="w-full rounded border"
              />
            </div>
          )}

          {/* Exam Points */}
          {knowledge.examPoints && knowledge.examPoints.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-slate-500 mb-2">
                考点
                <Badge variant="outline" className="ml-1 text-[10px]">
                  {knowledge.examPoints.length}
                </Badge>
              </h4>
              <div className="space-y-3">
                {knowledge.examPoints.map((ep) => (
                  <div key={ep.id} className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                    <div className="flex items-center gap-1 mb-1">
                      {ep.category && (
                        <Badge className="text-[10px] bg-amber-200 text-amber-800 hover:bg-amber-200">
                          {ep.category}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-amber-900">{ep.description}</p>
                    {ep.examQuestions && ep.examQuestions.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {ep.examQuestions.map((eq) => (
                          <div key={eq.id} className="bg-white rounded p-2 text-xs border border-red-100">
                            <div className="flex items-center gap-1 mb-1">
                              <Badge variant="outline" className="text-[10px] border-red-300 text-red-600">
                                {eq.type}
                              </Badge>
                            </div>
                            {eq.content && <p className="text-slate-700 mb-1">{eq.content}</p>}
                            {eq.image && (
                              <img src={eq.image} alt="题目图片" className="w-full rounded mb-1" />
                            )}
                            {eq.answer && (
                              <div className="text-green-700 font-medium">答案: {eq.answer}</div>
                            )}
                            {eq.analysis && (
                              <div className="text-slate-500 mt-1">解析: {eq.analysis}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
