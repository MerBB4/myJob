import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const numId = parseInt(id)
    if (isNaN(numId)) return NextResponse.json({ error: '无效的ID' }, { status: 400 })
    const b = await req.json()
    const d: Record<string, unknown> = {}
    if (b.type !== undefined) d.type = b.type
    if (b.content !== undefined) d.content = b.content
    if (b.answer !== undefined) d.answer = b.answer
    if (b.analysis !== undefined) d.analysis = b.analysis
    if (b.image !== undefined) d.image = b.image
    return NextResponse.json(await prisma.examQuestion.update({ where: { id: numId }, data: d }))
  } catch (e) {
    console.error('PUT /api/exam-questions/[id] error:', e)
    return NextResponse.json({ error: '更新真题失败' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const numId = parseInt(id)
    if (isNaN(numId)) return NextResponse.json({ error: '无效的ID' }, { status: 400 })
    await prisma.examQuestion.delete({ where: { id: numId } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('DELETE /api/exam-questions/[id] error:', e)
    return NextResponse.json({ error: '删除真题失败' }, { status: 500 })
  }
}
