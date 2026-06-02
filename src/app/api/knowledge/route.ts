import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
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
  } catch (e) {
    console.error('POST /api/knowledge error:', e)
    return NextResponse.json({ error: '创建知识点失败' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const chapterId = new URL(req.url).searchParams.get('chapterId')
    if (!chapterId) return NextResponse.json({ error: '需要 chapterId' }, { status: 400 })
    const numId = parseInt(chapterId)
    if (isNaN(numId)) return NextResponse.json({ error: '无效的 chapterId' }, { status: 400 })
    const list = await prisma.knowledge.findMany({
      where: { chapterId: numId },
      include: { examPoints: { include: { examQuestions: true } } },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(list)
  } catch (e) {
    console.error('GET /api/knowledge error:', e)
    return NextResponse.json({ error: '获取知识点列表失败' }, { status: 500 })
  }
}
