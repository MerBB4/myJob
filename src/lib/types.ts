// === Knowledge Graph Nodes ===
export interface SubjectNode {
  id: number
  name: string
  chapterCount: number
  knowledgeCount: number
  questionCount: number
}

export interface KnowledgeNode {
  id: number
  chapterId: number
  name: string
  mnemonic: string | null
  detail: string | null
  distinctions: { title: string; content: string }[] | null
  formulas: { name: string; formula: string }[] | null
  mindMap: string | null
  examPoints: ExamPointNode[]
}

export interface ExamPointNode {
  id: number
  description: string
  category: string | null
  examQuestions: ExamQuestionNode[]
}

export interface ExamQuestionNode {
  id: number
  type: string
  image: string | null
  content: string | null
  answer: string | null
  analysis: string | null
}

// === Form Input ===
export interface KnowledgeFormData {
  chapterId: number
  name: string
  mnemonic: string
  detail: string
  distinctions: { title: string; content: string }[]
  formulas: { name: string; formula: string }[]
  mindMap: File | null
}

// === OCR ===
export interface OcrResult {
  text: string
  language: string
}

export interface AiCorrection {
  field: string
  original: string
  corrected: string
  supplement: string | null
}

export interface OcrReviewData {
  ocrText: string
  corrections: AiCorrection[]
  structured: KnowledgeFormData
}

// === AI Config ===
export interface AiConfig {
  enabled: boolean
  provider: 'deepseek' | 'openai' | 'qwen'
  apiKey: string
  model: string
  baseUrl: string
}
