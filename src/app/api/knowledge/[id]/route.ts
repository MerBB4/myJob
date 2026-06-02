import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const k = await prisma.knowledge.findUnique({
    where: { id: parseInt(id) },
    include: { examPoints: { include: { examQuestions: true } } },
  })
  if (!k) return NextResponse.json({ error: '未找到' }, { status: 404 })
  return NextResponse.json(k)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const b = await req.json()
  const d: Record<string, unknown> = {}
  if (b.name !== undefined) d.name = b.name?.trim()
  if (b.mnemonic !== undefined) d.mnemonic = b.mnemonic
  if (b.detail !== undefined) d.detail = b.detail
  if (b.distinctions !== undefined) d.distinctions = b.distinctions
  if (b.formulas !== undefined) d.formulas = b.formulas
  if (b.mindMap !== undefined) d.mindMap = b.mindMap
  return NextResponse.json(await prisma.knowledge.update({ where: { id: parseInt(id) }, data: d }))
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await prisma.knowledge.delete({ where: { id: parseInt((await params).id) } })
  return NextResponse.json({ ok: true })
}
