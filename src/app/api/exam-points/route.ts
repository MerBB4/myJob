import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { knowledgeId, description, category } = await req.json()
    if (!knowledgeId || !description?.trim()) {
      return NextResponse.json({ error: '知识点ID和考点描述不能为空' }, { status: 400 })
    }
    const p = await prisma.examPoint.create({
      data: { knowledgeId, description: description.trim(), category: category || null },
    })
    return NextResponse.json(p, { status: 201 })
  } catch (e) {
    console.error('POST /api/exam-points error:', e)
    return NextResponse.json({ error: '创建考点失败' }, { status: 500 })
  }
}
