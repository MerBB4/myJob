import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { examPointId, type, content, answer, analysis, image } = await req.json()
    if (!examPointId || !type) {
      return NextResponse.json({ error: '考点ID和题型不能为空' }, { status: 400 })
    }
    const q = await prisma.examQuestion.create({
      data: { examPointId, type, content: content || null, answer: answer || null, analysis: analysis || null, image: image || null },
    })
    return NextResponse.json(q, { status: 201 })
  } catch (e) {
    console.error('POST /api/exam-questions error:', e)
    return NextResponse.json({ error: '创建真题失败' }, { status: 500 })
  }
}
