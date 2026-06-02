import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { chapterId, name, mnemonic, detail, distinctions, formulas, mindMap } = body
  if (!chapterId || !name?.trim()) {
    return NextResponse.json({ error: '章节ID和知识点名称不能为空' }, { status: 400 })
  }
  const k = await prisma.knowledge.create({
    data: {
      chapterId, name: name.trim(),
      mnemonic: mnemonic || null, detail: detail || null,
      distinctions: distinctions || null, formulas: formulas || null,
      mindMap: mindMap || null,
    },
  })
  return NextResponse.json(k, { status: 201 })
}

export async function GET(req: NextRequest) {
  const chapterId = new URL(req.url).searchParams.get('chapterId')
  if (!chapterId) return NextResponse.json({ error: '需要 chapterId' }, { status: 400 })
  const list = await prisma.knowledge.findMany({
    where: { chapterId: parseInt(chapterId) },
    include: { examPoints: { include: { examQuestions: true } } },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(list)
}
