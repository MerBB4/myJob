import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        chapters: {
          include: {
            knowledge: {
              include: { examPoints: { include: { examQuestions: true } } }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    const result = subjects.map(s => {
      const knowledgeCount = s.chapters.reduce((sum, c) => sum + c.knowledge.length, 0)
      const questionCount = s.chapters.reduce(
        (sum, c) =>
          sum + c.knowledge.reduce(
            (ks, k) => ks + k.examPoints.reduce((ps, p) => ps + p.examQuestions.length, 0), 0
          ), 0
      )
      return {
        id: s.id,
        name: s.name,
        chapters: s.chapters.map(c => ({ id: c.id, title: c.title, order: c.order })),
        chapterCount: s.chapters.length,
        knowledgeCount,
        questionCount,
      }
    })

    return NextResponse.json(result)
  } catch (e) {
    console.error('GET /api/subjects error:', e)
    return NextResponse.json({ error: '获取学科列表失败' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json()
    if (!name || !name.trim()) {
      return NextResponse.json({ error: '学科名不能为空' }, { status: 400 })
    }
    const subject = await prisma.subject.create({ data: { name: name.trim() } })
    return NextResponse.json(subject, { status: 201 })
  } catch (e) {
    console.error('POST /api/subjects error:', e)
    return NextResponse.json({ error: '创建学科失败' }, { status: 500 })
  }
}
