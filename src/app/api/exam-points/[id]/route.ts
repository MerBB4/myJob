import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const numId = parseInt(id)
    if (isNaN(numId)) return NextResponse.json({ error: '无效的ID' }, { status: 400 })
    const b = await req.json()
    const d: Record<string, unknown> = {}
    if (b.description !== undefined) d.description = b.description?.trim()
    if (b.category !== undefined) d.category = b.category
    return NextResponse.json(await prisma.examPoint.update({ where: { id: numId }, data: d }))
  } catch (e) {
    console.error('PUT /api/exam-points/[id] error:', e)
    return NextResponse.json({ error: '更新考点失败' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const numId = parseInt(id)
    if (isNaN(numId)) return NextResponse.json({ error: '无效的ID' }, { status: 400 })
    await prisma.examPoint.delete({ where: { id: numId } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('DELETE /api/exam-points/[id] error:', e)
    return NextResponse.json({ error: '删除考点失败' }, { status: 500 })
  }
}
