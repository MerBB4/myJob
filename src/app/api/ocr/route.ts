import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const fd = await req.formData()
    const file = fd.get('image') as File | null
    if (!file) return NextResponse.json({ error: '未提供图片文件' }, { status: 400 })
    const buffer = Buffer.from(await file.arrayBuffer())
    const Tesseract = await import('tesseract.js')
    const { data } = await Tesseract.recognize(buffer, 'chi_sim')
    return NextResponse.json({ text: data.text.trim(), confidence: data.confidence, language: 'chi_sim' })
  } catch (e) {
    console.error('OCR error:', e)
    return NextResponse.json({ error: 'OCR 识别失败' }, { status: 500 })
  }
}
