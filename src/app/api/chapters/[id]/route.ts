import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { title, order } = await req.json()
  const data: Record<string, unknown> = {}
  if (title !== undefined) data.title = title
  if (order !== undefined) data.order = order
  const chapter = await prisma.chapter.update({
    where: { id: parseInt(id) },
    data,
  })
  return NextResponse.json(chapter)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.chapter.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ ok: true })
}
