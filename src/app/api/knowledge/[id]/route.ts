import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

function parseId(id: string) {
  const num = parseInt(id)
  if (isNaN(num)) return null
  return num
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const numId = parseId(id)
    if (numId === null) return NextResponse.json({ error: '无效的ID' }, { status: 400 })
    const k = await prisma.knowledge.findUnique({
      where: { id: numId },
      include: { examPoints: { include: { examQuestions: true } } },
    })
    if (!k) return NextResponse.json({ error: '未找到' }, { status: 404 })
    return NextResponse.json(k)
  } catch (e) {
    console.error('GET /api/knowledge/[id] error:', e)
    return NextResponse.json({ error: '获取知识点失败' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const numId = parseId(id)
    if (numId === null) return NextResponse.json({ error: '无效的ID' }, { status: 400 })
    const b = await req.json()
    const d: Record<string, unknown> = {}
    if (b.name !== undefined) d.name = b.name?.trim()
    if (b.mnemonic !== undefined) d.mnemonic = b.mnemonic
    if (b.detail !== undefined) d.detail = b.detail
    if (b.distinctions !== undefined) d.distinctions = b.distinctions
    if (b.formulas !== undefined) d.formulas = b.formulas
    if (b.mindMap !== undefined) d.mindMap = b.mindMap
    return NextResponse.json(await prisma.knowledge.update({ where: { id: numId }, data: d }))
  } catch (e) {
    console.error('PUT /api/knowledge/[id] error:', e)
    return NextResponse.json({ error: '更新知识点失败' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const numId = parseId(id)
    if (numId === null) return NextResponse.json({ error: '无效的ID' }, { status: 400 })
    await prisma.knowledge.delete({ where: { id: numId } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('DELETE /api/knowledge/[id] error:', e)
    return NextResponse.json({ error: '删除知识点失败' }, { status: 500 })
  }
}
