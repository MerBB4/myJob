import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { name } = await req.json()
  if (!name || !name.trim()) {
    return NextResponse.json({ error: '学科名不能为空' }, { status: 400 })
  }
  const subject = await prisma.subject.update({
    where: { id: parseInt(id) },
    data: { name: name.trim() },
  })
  return NextResponse.json(subject)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.subject.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ ok: true })
}
