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
    const { title, order } = await req.json()
    const data: Record<string, unknown> = {}
    if (title !== undefined) data.title = title
    if (order !== undefined) data.order = order
    const chapter = await prisma.chapter.update({
      where: { id: numId },
      data,
    })
    return NextResponse.json(chapter)
  } catch (e) {
    console.error('PUT /api/chapters/[id] error:', e)
    return NextResponse.json({ error: '更新章节失败' }, { status: 500 })
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
    await prisma.chapter.delete({ where: { id: numId } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('DELETE /api/chapters/[id] error:', e)
    return NextResponse.json({ error: '删除章节失败' }, { status: 500 })
  }
}
