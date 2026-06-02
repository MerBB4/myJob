import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { subjectId, title } = await req.json()
    if (!subjectId || !title?.trim()) {
      return NextResponse.json({ error: '学科ID和章节标题不能为空' }, { status: 400 })
    }
    const maxOrder = await prisma.chapter.aggregate({
      where: { subjectId },
      _max: { order: true },
    })
    const chapter = await prisma.chapter.create({
      data: {
        subjectId,
        title: title.trim(),
        order: (maxOrder._max.order ?? -1) + 1,
      },
    })
    return NextResponse.json(chapter, { status: 201 })
  } catch (e) {
    console.error('POST /api/chapters error:', e)
    return NextResponse.json({ error: '创建章节失败' }, { status: 500 })
  }
}
