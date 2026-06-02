import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const ALLOWED_KEYS = new Set(['ai_model', 'ai_base_url'])

export async function GET() {
  try {
    const configs = await prisma.appConfig.findMany()
    const result: Record<string, string> = {}
    for (const c of configs) {
      if (ALLOWED_KEYS.has(c.key)) {
        result[c.key] = c.value
      }
    }
    return NextResponse.json(result)
  } catch (e) {
    console.error('GET /api/config error:', e)
    return NextResponse.json({ error: '获取配置失败' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { key, value } = await req.json()
    if (!key || !ALLOWED_KEYS.has(key)) {
      return NextResponse.json({ error: '无效的配置键' }, { status: 400 })
    }
    if (value === undefined) {
      return NextResponse.json({ error: '配置值不能为空' }, { status: 400 })
    }
    await prisma.appConfig.upsert({ where: { key }, update: { value }, create: { key, value } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('POST /api/config error:', e)
    return NextResponse.json({ error: '保存配置失败' }, { status: 500 })
  }
}
