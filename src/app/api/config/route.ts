import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const configs = await prisma.appConfig.findMany()
  const result: Record<string, string> = {}
  for (const c of configs) result[c.key] = c.value
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const { key, value } = await req.json()
  await prisma.appConfig.upsert({ where: { key }, update: { value }, create: { key, value } })
  return NextResponse.json({ ok: true })
}
