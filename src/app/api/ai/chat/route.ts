import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { message, apiKey, baseUrl, model } = await req.json()
  if (!message || !apiKey) {
    return NextResponse.json({ error: '消息和 API Key 不能为空' }, { status: 400 })
  }
  try {
    const res = await fetch(`${baseUrl || 'https://api.deepseek.com'}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: model || 'deepseek-chat',
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
    return NextResponse.json({ reply: data.choices[0].message.content })
  } catch (e) {
    console.error('AI chat error:', e)
    return NextResponse.json({ error: 'AI 调用失败' }, { status: 500 })
  }
}
