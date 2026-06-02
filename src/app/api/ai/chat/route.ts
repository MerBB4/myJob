import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { message } = await req.json()
  if (!message) {
    return NextResponse.json({ error: '消息不能为空' }, { status: 400 })
  }

  const apiKey = process.env.AI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'AI_API_KEY 未配置，请在 .env 中设置' }, { status: 500 })
  }

  const baseUrl = process.env.AI_BASE_URL || 'https://api.deepseek.com'
  const model = process.env.AI_MODEL || 'deepseek-chat'

  try {
    const res = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: '你是一个考编备考助手。帮助用户识别错别字、补充考点、生成真题、解释概念。回答简洁有条理。' },
          { role: 'user', content: message },
        ],
        temperature: 0.7, max_tokens: 2000,
      }),
    })
    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: `AI API 错误: ${err}` }, { status: res.status })
    }
    const data = await res.json()
    const reply = data.choices?.[0]?.message?.content || '无响应'
    return NextResponse.json({ reply })
  } catch {
    return NextResponse.json({ error: 'AI 调用失败' }, { status: 500 })
  }
}
