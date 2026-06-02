import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const numId = parseInt(id)
    if (isNaN(numId)) return NextResponse.json({ error: '无效的ID' }, { status: 400 })
    const { name } = await req.json()
    if (!name || !name.trim()) {
      return NextResponse.json({ error: '学科名不能为空' }, { status: 400 })
    }
    const subject = await prisma.subject.update({
      where: { id: numId },
      data: { name: name.trim() },
    })
    return NextResponse.json(subject)
  } catch (e) {
    console.error('PUT /api/subjects/[id] error:', e)
    return NextResponse.json({ error: '更新学科失败' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const numId = parseInt(id)
    if (isNaN(numId)) return NextResponse.json({ error: '无效的ID' }, { status: 400 })
    await prisma.subject.delete({ where: { id: numId } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('DELETE /api/subjects/[id] error:', e)
    return NextResponse.json({ error: '删除学科失败' }, { status: 500 })
  }
}
