'use client'

import type { KnowledgeNode } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight } from 'lucide-react'

interface KnowledgeCardProps {
  knowledge: KnowledgeNode
  onClick: () => void
}

const levelColors: Record<string, string> = {
  chapter: '#475569',
  knowledge: '#0369a1',
  'exam-point': '#a16207',
  'exam-question': '#b91c1c',
}

export function KnowledgeCard({ knowledge, onClick }: KnowledgeCardProps) {
  const formulasCount = knowledge.formulas?.length ?? 0
  const examPointsCount = knowledge.examPoints?.length ?? 0
  const questionsCount = knowledge.examPoints?.reduce((acc, ep) => acc + (ep.examQuestions?.length ?? 0), 0) ?? 0

  return (
    <Card
      className="p-4 cursor-pointer interactive-card interactive-press border-l-4"
      style={{ borderLeftColor: levelColors.knowledge }}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: levelColors.knowledge }}
            />
            <span className="text-xs text-slate-500">知识点</span>
          </div>
          <h3 className="font-semibold text-slate-800 truncate">{knowledge.name}</h3>
          {knowledge.mnemonic && (
            <p className="text-xs text-slate-500 mt-1 truncate">
              <span className="text-amber-500 font-medium">口诀:</span> {knowledge.mnemonic}
            </p>
          )}
          <div className="flex gap-2 mt-2 flex-wrap">
            {formulasCount > 0 && (
              <Badge variant="secondary" className="text-[10px]">
                {formulasCount} 公式
              </Badge>
            )}
            {examPointsCount > 0 && (
              <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700">
                {examPointsCount} 考点
              </Badge>
            )}
            {questionsCount > 0 && (
              <Badge variant="outline" className="text-[10px] border-red-300 text-red-600">
                {questionsCount} 真题
              </Badge>
            )}
          </div>
        </div>

        {/* Exam point sub-cards */}
        {examPointsCount > 0 && (
          <div className="flex items-center gap-1">
            <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
            <div className="flex flex-col gap-1 max-w-[180px]">
              {knowledge.examPoints.slice(0, 3).map((ep) => (
                <div
                  key={ep.id}
                  className="text-[11px] px-2 py-1 rounded bg-amber-50 border border-amber-100 text-amber-800 truncate"
                >
                  {ep.description.length > 20 ? ep.description.slice(0, 20) + '...' : ep.description}
                </div>
              ))}
              {examPointsCount > 3 && (
                <span className="text-[10px] text-slate-400">+{examPointsCount - 3} 更多考点</span>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
