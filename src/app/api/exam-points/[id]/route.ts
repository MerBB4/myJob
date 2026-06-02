import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const b = await req.json()
  const d: Record<string, unknown> = {}
  if (b.description !== undefined) d.description = b.description?.trim()
  if (b.category !== undefined) d.category = b.category
  return NextResponse.json(await prisma.examPoint.update({ where: { id: parseInt(id) }, data: d }))
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await prisma.examPoint.delete({ where: { id: parseInt((await params).id) } })
  return NextResponse.json({ ok: true })
}
