# 考编笔记系统 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建考编笔记系统 v1 — 4 层知识图谱、双路径录入（手动+OCR/AI校验）、三栏布局、AI 双通道（API+内嵌终端）

**Architecture:** Next.js 14 App Router 全栈应用，前端 shadcn/ui 三栏布局 + xterm.js 终端，后端 API Routes + WebSocket，Prisma ORM 连接本地 MySQL 5.7

**Tech Stack:** Next.js 14 + TypeScript + shadcn/ui + Tailwind CSS + Prisma + MySQL 5.7 + xterm.js + node-pty + Tesseract.js + Zustand + React Query

**Environment:**
- MySQL: `root:root@localhost:3306` | `D:\Program Files\mysql-5.7.35-winx64\bin\mysql.exe`
- Node: Node.js 18+ (check with `node -v`)
- Project root: `D:\WorkSpace\myJob` (existing git repo, already connected to GitHub via SSH)

**Order of execution:** Tasks are numbered sequentially. Each task is self-contained and commits independently.

---

### Task 0: 环境检查 & 项目准备

**Files:**
- Create: `.env`
- Modify: `.gitignore`

- [ ] **Step 1: 检查 Node.js 和 npm**

```bash
node -v && npm -v
```
Expected: Node.js 18+

- [ ] **Step 2: 创建 .env 文件**

```env
DATABASE_URL="mysql://root:root@localhost:3306/exam_note"
```

- [ ] **Step 3: 确认 .gitignore 已包含 .env**

```bash
grep ".env" .gitignore
```
If not present, add `.env` to `.gitignore`.

- [ ] **Step 4: 确认 MySQL 连接正常**

```bash
"D:/Program Files/mysql-5.7.35-winx64/bin/mysql.exe" -u root -proot -e "SELECT 1 as test;"
```
Expected: `1`

- [ ] **Step 5: 创建数据库**

```bash
"D:/Program Files/mysql-5.7.35-winx64/bin/mysql.exe" -u root -proot -e "CREATE DATABASE IF NOT EXISTS exam_note CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "chore: environment setup and database created"
```

---

### Task 1: 脚手架 — Next.js + TypeScript + shadcn/ui

**Files:** 创建整个 Next.js 项目结构

- [ ] **Step 1: 创建 Next.js 项目**

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack
```

提示覆盖时选 yes 并等待安装完成。

- [ ] **Step 2: 安装 shadcn/ui CLI 并初始化**

```bash
npx shadcn@latest init -d
```

- [ ] **Step 3: 安装必要的 shadcn/ui 组件**

```bash
npx shadcn@latest add button input textarea select card badge separator scroll-area dialog dropdown-menu tabs tooltip command popover sonner
```

- [ ] **Step 4: 安装其他前端依赖**

```bash
npm install zustand @tanstack/react-query @xterm/xterm xterm-addon-fit xterm-addon-web-links
npm install -D @types/node
```

- [ ] **Step 5: 安装后端依赖**

```bash
npm install prisma @prisma/client ws sharp tesseract.js
npm install -D @types/ws
```

- [ ] **Step 6: 初始化 Prisma**

```bash
npx prisma init
```

- [ ] **Step 7: 验证项目能启动**

```bash
npm run dev
```
打开 `http://localhost:3000` 确认 Next.js 默认页面显示正常，然后 Ctrl+C 停止。

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: scaffold Next.js + shadcn/ui + Prisma"
```

---

### Task 2: 数据库模型 — Prisma Schema

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: 写 Prisma Schema**

将 `prisma/schema.prisma` 替换为：

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model Subject {
  id        Int       @id @default(autoincrement())
  name      String    @db.VarChar(100)
  chapters  Chapter[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Chapter {
  id        Int         @id @default(autoincrement())
  subjectId Int
  subject   Subject     @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  title     String      @db.VarChar(200)
  order     Int         @default(0)
  knowledge Knowledge[]
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
}

model Knowledge {
  id           Int           @id @default(autoincrement())
  chapterId    Int
  chapter      Chapter       @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  name         String        @db.VarChar(300)
  mnemonic     String?       @db.VarChar(500)
  detail       String?       @db.Text
  distinctions Json?
  formulas     Json?
  mindMap      String?       @db.VarChar(500)
  examPoints   ExamPoint[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}

model ExamPoint {
  id            Int             @id @default(autoincrement())
  knowledgeId   Int
  knowledge     Knowledge       @relation(fields: [knowledgeId], references: [id], onDelete: Cascade)
  description   String          @db.Text
  category      String?         @db.VarChar(50)
  examQuestions ExamQuestion[]
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
}

model ExamQuestion {
  id          Int       @id @default(autoincrement())
  examPointId Int
  examPoint   ExamPoint @relation(fields: [examPointId], references: [id], onDelete: Cascade)
  type        String    @db.VarChar(20)
  image       String?   @db.VarChar(500)
  content     String?   @db.Text
  answer      String?   @db.VarChar(200)
  analysis    String?   @db.Text
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model AppConfig {
  id    Int    @id @default(autoincrement())
  key   String @unique @db.VarChar(100)
  value String @db.Text
}
```

- [ ] **Step 2: 运行数据库迁移**

```bash
npx prisma migrate dev --name init
```
Expected: "Your database is now in sync with your schema."

- [ ] **Step 3: 生成 Prisma 客户端**

```bash
npx prisma generate
```

- [ ] **Step 4: 验证表已创建**

```bash
"D:/Program Files/mysql-5.7.35-winx64/bin/mysql.exe" -u root -proot exam_note -e "SHOW TABLES;"
```
Expected: 6 tables

- [ ] **Step 5: Commit**

```bash
git add prisma/ && git commit -m "feat: database schema with Prisma migration"
```

---

### Task 3: Prisma 客户端单例 & 基础类型

**Files:**
- Create: `src/lib/db.ts`
- Create: `src/lib/types.ts`

- [ ] **Step 1: 写 Prisma 客户端单例 `src/lib/db.ts`**

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

- [ ] **Step 2: 写共享类型 `src/lib/types.ts`**

```typescript
// === 知识图谱层级 ===
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

// === 表单录入 ===
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

// === AI 配置 ===
export interface AiConfig {
  enabled: boolean
  provider: 'deepseek' | 'openai' | 'qwen'
  apiKey: string
  model: string
  baseUrl: string
}
```

- [ ] **Step 3: 验证 TypeScript 编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/ && git commit -m "feat: Prisma client singleton and shared types"
```

---

### Task 4: API — 学科 & 章节 CRUD

**Files:**
- Create: `src/app/api/subjects/route.ts`
- Create: `src/app/api/subjects/[id]/route.ts`
- Create: `src/app/api/chapters/route.ts`
- Create: `src/app/api/chapters/[id]/route.ts`

- [ ] **Step 1: 写学科列表+创建 `src/app/api/subjects/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const subjects = await prisma.subject.findMany({
    include: {
      chapters: {
        include: {
          knowledge: {
            include: {
              examPoints: { include: { examQuestions: true } }
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  })

  const result = subjects.map(s => {
    const knowledgeCount = s.chapters.reduce((sum, c) => sum + c.knowledge.length, 0)
    const questionCount = s.chapters.reduce(
      (sum, c) =>
        sum + c.knowledge.reduce(
          (ks, k) => ks + k.examPoints.reduce((ps, p) => ps + p.examQuestions.length, 0), 0
        ), 0
    )
    return {
      id: s.id,
      name: s.name,
      chapterCount: s.chapters.length,
      knowledgeCount,
      questionCount,
    }
  })

  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const { name } = await req.json()
  if (!name || !name.trim()) {
    return NextResponse.json({ error: '学科名不能为空' }, { status: 400 })
  }
  const subject = await prisma.subject.create({ data: { name: name.trim() } })
  return NextResponse.json(subject, { status: 201 })
}
```

- [ ] **Step 2: 写学科更新+删除 `src/app/api/subjects/[id]/route.ts`**

```typescript
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
```

- [ ] **Step 3: 写章节创建 `src/app/api/chapters/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { subjectId, title } = await req.json()
  if (!subjectId || !title?.trim()) {
    return NextResponse.json({ error: '学科ID和章节标题不能为空' }, { status: 400 })
  }
  const maxOrder = await prisma.chapter.aggregate({
    where: { subjectId },
    _max: { order: true },
  })
  const chapter = await prisma.chapter.create({
    data: {
      subjectId,
      title: title.trim(),
      order: (maxOrder._max.order ?? -1) + 1,
    },
  })
  return NextResponse.json(chapter, { status: 201 })
}
```

- [ ] **Step 4: 写章节更新+删除 `src/app/api/chapters/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { title, order } = await req.json()
  const chapter = await prisma.chapter.update({
    where: { id: parseInt(id) },
    data: { ...(title && { title }), ...(order !== undefined && { order }) },
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
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/ && git commit -m "feat: subject and chapter CRUD APIs"
```

---

### Task 5: API — 知识点 & 考点 & 真题 CRUD

**Files:**
- Create: `src/app/api/knowledge/route.ts`
- Create: `src/app/api/knowledge/[id]/route.ts`
- Create: `src/app/api/exam-points/route.ts`
- Create: `src/app/api/exam-points/[id]/route.ts`
- Create: `src/app/api/exam-questions/route.ts`
- Create: `src/app/api/exam-questions/[id]/route.ts`

- [ ] **Step 1: 写知识点 API `src/app/api/knowledge/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { chapterId, name, mnemonic, detail, distinctions, formulas, mindMap } = body
  if (!chapterId || !name?.trim()) {
    return NextResponse.json({ error: '章节ID和知识点名称不能为空' }, { status: 400 })
  }
  const knowledge = await prisma.knowledge.create({
    data: {
      chapterId,
      name: name.trim(),
      mnemonic: mnemonic || null,
      detail: detail || null,
      distinctions: distinctions || null,
      formulas: formulas || null,
      mindMap: mindMap || null,
    },
  })
  return NextResponse.json(knowledge, { status: 201 })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const chapterId = searchParams.get('chapterId')
  if (!chapterId) {
    return NextResponse.json({ error: '需要 chapterId 参数' }, { status: 400 })
  }
  const knowledge = await prisma.knowledge.findMany({
    where: { chapterId: parseInt(chapterId) },
    include: {
      examPoints: { include: { examQuestions: true } }
    },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(knowledge)
}
```

- [ ] **Step 2: 写知识点详情+更新+删除 `src/app/api/knowledge/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const knowledge = await prisma.knowledge.findUnique({
    where: { id: parseInt(id) },
    include: {
      examPoints: { include: { examQuestions: true } }
    },
  })
  if (!knowledge) {
    return NextResponse.json({ error: '未找到' }, { status: 404 })
  }
  return NextResponse.json(knowledge)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const data: Record<string, unknown> = {}
  if (body.name !== undefined) data.name = body.name?.trim()
  if (body.mnemonic !== undefined) data.mnemonic = body.mnemonic
  if (body.detail !== undefined) data.detail = body.detail
  if (body.distinctions !== undefined) data.distinctions = body.distinctions
  if (body.formulas !== undefined) data.formulas = body.formulas
  if (body.mindMap !== undefined) data.mindMap = body.mindMap
  const knowledge = await prisma.knowledge.update({
    where: { id: parseInt(id) },
    data,
  })
  return NextResponse.json(knowledge)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.knowledge.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 3: 写考点 API `src/app/api/exam-points/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { knowledgeId, description, category } = await req.json()
  if (!knowledgeId || !description?.trim()) {
    return NextResponse.json({ error: '知识点ID和考点描述不能为空' }, { status: 400 })
  }
  const point = await prisma.examPoint.create({
    data: { knowledgeId, description: description.trim(), category: category || null },
  })
  return NextResponse.json(point, { status: 201 })
}
```

- [ ] **Step 4: 写考点更新+删除 `src/app/api/exam-points/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const data: Record<string, unknown> = {}
  if (body.description !== undefined) data.description = body.description?.trim()
  if (body.category !== undefined) data.category = body.category
  const point = await prisma.examPoint.update({
    where: { id: parseInt(id) },
    data,
  })
  return NextResponse.json(point)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.examPoint.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 5: 写真题 API `src/app/api/exam-questions/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { examPointId, type, content, answer, analysis, image } = await req.json()
  if (!examPointId || !type) {
    return NextResponse.json({ error: '考点ID和题型不能为空' }, { status: 400 })
  }
  const question = await prisma.examQuestion.create({
    data: {
      examPointId,
      type,
      content: content || null,
      answer: answer || null,
      analysis: analysis || null,
      image: image || null,
    },
  })
  return NextResponse.json(question, { status: 201 })
}
```

- [ ] **Step 6: 写真题更新+删除 `src/app/api/exam-questions/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const data: Record<string, unknown> = {}
  if (body.type !== undefined) data.type = body.type
  if (body.content !== undefined) data.content = body.content
  if (body.answer !== undefined) data.answer = body.answer
  if (body.analysis !== undefined) data.analysis = body.analysis
  if (body.image !== undefined) data.image = body.image
  const question = await prisma.examQuestion.update({
    where: { id: parseInt(id) },
    data,
  })
  return NextResponse.json(question)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.examQuestion.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 7: 验证 TypeScript 编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 8: Commit**

```bash
git add src/app/api/ && git commit -m "feat: knowledge, exam point and question CRUD APIs"
```

---

### Task 6: 三栏布局组件

**Files:**
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Create: `src/components/Providers.tsx`
- Create: `src/components/layout/LeftSidebar.tsx`
- Create: `src/components/layout/MainContent.tsx`
- Create: `src/components/layout/RightPanel.tsx`
- Create: `src/lib/store.ts`

- [ ] **Step 1: 写 Zustand 全局状态 `src/lib/store.ts`**

```typescript
import { create } from 'zustand'

export type ViewMode = 'graph' | 'list' | 'quiz'
export type RightPanelMode = 'ai' | 'terminal'

interface AppState {
  selectedSubjectId: number | null
  setSelectedSubjectId: (id: number | null) => void

  selectedChapterId: number | null
  setSelectedChapterId: (id: number | null) => void

  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void

  rightPanelMode: RightPanelMode
  setRightPanelMode: (mode: RightPanelMode) => void

  showOcrPanel: boolean
  setShowOcrPanel: (show: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  selectedSubjectId: null,
  setSelectedSubjectId: (id) => set({ selectedSubjectId: id }),

  selectedChapterId: null,
  setSelectedChapterId: (id) => set({ selectedChapterId: id }),

  viewMode: 'graph',
  setViewMode: (mode) => set({ viewMode: mode }),

  rightPanelMode: 'ai',
  setRightPanelMode: (mode) => set({ rightPanelMode: mode }),

  showOcrPanel: false,
  setShowOcrPanel: (show) => set({ showOcrPanel: show }),
}))
```

- [ ] **Step 2: 写全局样式 `src/app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-chapter: #475569;
    --color-knowledge: #0369a1;
    --color-exam-point: #a16207;
    --color-exam-question: #b91c1c;
  }
}
```

- [ ] **Step 3: 写根布局 `src/app/layout.tsx`**

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '考编笔记',
  description: '知识图谱笔记系统',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.className} h-screen overflow-hidden`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

- [ ] **Step 4: 写 Providers `src/components/Providers.tsx`**

```typescript
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Toaster } from '@/components/ui/sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
    </QueryClientProvider>
  )
}
```

- [ ] **Step 5: 写左栏导航 `src/components/layout/LeftSidebar.tsx`**

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Image, Shuffle } from 'lucide-react'
import { useState } from 'react'
import { Input } from '@/components/ui/input'

export function LeftSidebar() {
  const {
    selectedSubjectId,
    selectedChapterId,
    setSelectedSubjectId,
    setSelectedChapterId,
    setViewMode,
  } = useAppStore()
  const [newSubject, setNewSubject] = useState('')
  const [newChapter, setNewChapter] = useState('')

  const { data: subjects, refetch } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => fetch('/api/subjects').then((r) => r.json()),
  })

  const createSubject = async () => {
    if (!newSubject.trim()) return
    await fetch('/api/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newSubject }),
    })
    setNewSubject('')
    refetch()
  }

  const createChapter = async () => {
    if (!newChapter.trim() || !selectedSubjectId) return
    await fetch('/api/chapters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subjectId: selectedSubjectId, title: newChapter }),
    })
    setNewChapter('')
    refetch()
  }

  const selectedSubject = subjects?.find(
    (s: { id: number }) => s.id === selectedSubjectId
  )

  return (
    <div className="w-[190px] h-full bg-slate-50 border-r flex flex-col">
      {/* 学科列表 */}
      <div className="p-3 border-b">
        <h2 className="text-xs font-semibold text-slate-500 uppercase mb-2">学科分类</h2>
        {subjects?.map((s: { id: number; name: string; knowledgeCount: number }) => (
          <div
            key={s.id}
            onClick={() => setSelectedSubjectId(s.id)}
            className={`text-sm px-2 py-1.5 rounded cursor-pointer mb-0.5 ${
              selectedSubjectId === s.id ? 'bg-slate-200 font-medium' : 'hover:bg-slate-100'
            }`}
          >
            <div className="truncate">{s.name}</div>
            <div className="text-[10px] text-slate-400">{s.knowledgeCount} 知识点</div>
          </div>
        ))}
        <div className="flex gap-1 mt-2">
          <Input
            placeholder="新建学科"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createSubject()}
            className="text-xs h-7"
          />
        </div>
      </div>

      {/* 章节列表 */}
      {selectedSubjectId && (
        <div className="p-3 border-b flex-1">
          <h2 className="text-xs font-semibold text-slate-500 uppercase mb-2">章节</h2>
          {(selectedSubject as { chapters?: { id: number; title: string }[] })?.chapters?.map(
            (c: { id: number; title: string }) => (
              <div
                key={c.id}
                onClick={() => setSelectedChapterId(c.id)}
                className={`text-sm px-2 py-1 rounded cursor-pointer mb-0.5 ${
                  selectedChapterId === c.id ? 'bg-slate-200 font-medium' : 'hover:bg-slate-100'
                }`}
              >
                {c.title}
              </div>
            )
          )}
          <div className="flex gap-1 mt-2">
            <Input
              placeholder="新建章节"
              value={newChapter}
              onChange={(e) => setNewChapter(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createChapter()}
              className="text-xs h-7"
            />
          </div>
        </div>
      )}

      {/* 快捷入口 */}
      <div className="p-3">
        <h2 className="text-xs font-semibold text-slate-500 uppercase mb-2">快捷入口</h2>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start text-xs mb-1"
          onClick={() => setViewMode('quiz')}
        >
          <Shuffle className="w-3 h-3 mr-1" /> 随机刷题
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start text-xs"
          onClick={() => useAppStore.getState().setShowOcrPanel(true)}
        >
          <Image className="w-3 h-3 mr-1" /> 截图导入
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: 写主内容区 `src/components/layout/MainContent.tsx`**

```typescript
'use client'

import { useAppStore } from '@/lib/store'
import { KnowledgeGraph } from '@/components/knowledge-graph/KnowledgeGraph'

export function MainContent() {
  const { viewMode, showOcrPanel } = useAppStore()

  if (showOcrPanel) {
    const OcrPanel = require('@/components/ocr-panel/OcrPanel').OcrPanel
    return <OcrPanel />
  }

  return (
    <div className="flex-1 h-full overflow-auto">
      {viewMode === 'graph' && <KnowledgeGraph />}
      {viewMode === 'list' && (
        <div className="flex items-center justify-center h-full text-slate-400">
          列表模式（后续实现）
        </div>
      )}
      {viewMode === 'quiz' && (
        <div className="flex items-center justify-center h-full text-slate-400">
          刷题模式（后续实现）
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 7: 写右栏 `src/components/layout/RightPanel.tsx`**

```typescript
'use client'

import { useAppStore } from '@/lib/store'
import { AiChat } from '@/components/ai-chat/AiChat'
import { TerminalPanel } from '@/components/terminal/TerminalPanel'
import { Button } from '@/components/ui/button'
import { MessageSquare, Terminal } from 'lucide-react'

export function RightPanel() {
  const { rightPanelMode, setRightPanelMode } = useAppStore()

  return (
    <div className="w-[280px] h-full border-l flex flex-col">
      <div className="flex border-b">
        <Button
          variant={rightPanelMode === 'ai' ? 'default' : 'ghost'}
          size="sm"
          className="flex-1 rounded-none text-xs"
          onClick={() => setRightPanelMode('ai')}
        >
          <MessageSquare className="w-3 h-3 mr-1" /> AI
        </Button>
        <Button
          variant={rightPanelMode === 'terminal' ? 'default' : 'ghost'}
          size="sm"
          className="flex-1 rounded-none text-xs"
          onClick={() => setRightPanelMode('terminal')}
        >
          <Terminal className="w-3 h-3 mr-1" /> 终端
        </Button>
      </div>
      <div className="flex-1 overflow-hidden">
        {rightPanelMode === 'ai' ? <AiChat /> : <TerminalPanel />}
      </div>
    </div>
  )
}
```

- [ ] **Step 8: 写主页 `src/app/page.tsx`**

```typescript
import { LeftSidebar } from '@/components/layout/LeftSidebar'
import { MainContent } from '@/components/layout/MainContent'
import { RightPanel } from '@/components/layout/RightPanel'

export default function Home() {
  return (
    <div className="flex h-full">
      <LeftSidebar />
      <MainContent />
      <RightPanel />
    </div>
  )
}
```

- [ ] **Step 9: 验证编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 10: Commit**

```bash
git add src/ && git commit -m "feat: three-column layout with sidebar and right panel"
```

---

### Task 7: 知识图谱组件

**Files:**
- Create: `src/components/knowledge-graph/KnowledgeGraph.tsx`
- Create: `src/components/knowledge-graph/KnowledgeCard.tsx`
- Create: `src/components/knowledge-graph/KnowledgeDetail.tsx`

- [ ] **Step 1: 写知识图谱主组件 `src/components/knowledge-graph/KnowledgeGraph.tsx`**

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import type { KnowledgeNode } from '@/lib/types'
import { KnowledgeCard } from './KnowledgeCard'
import { KnowledgeDetail } from './KnowledgeDetail'
import { useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export function KnowledgeGraph() {
  const { selectedChapterId } = useAppStore()
  const [activeKnowledgeId, setActiveKnowledgeId] = useState<number | null>(null)

  const { data: knowledgeList, isLoading } = useQuery<KnowledgeNode[]>({
    queryKey: ['knowledge', selectedChapterId],
    queryFn: () =>
      fetch(`/api/knowledge?chapterId=${selectedChapterId}`).then((r) => r.json()),
    enabled: !!selectedChapterId,
  })

  if (!selectedChapterId) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        请在左侧选择一个章节
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!knowledgeList?.length) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        该章节暂无知识点，点击左侧「截图导入」或使用 AI 面板添加
      </div>
    )
  }

  return (
    <div className="h-full flex">
      <div className={`flex-1 overflow-auto ${activeKnowledgeId ? 'border-r' : ''}`}>
        <div className="min-w-max p-4">
          <div className="flex gap-4 items-start">
            {knowledgeList.map((k) => (
              <KnowledgeCard
                key={k.id}
                knowledge={k}
                isActive={activeKnowledgeId === k.id}
                onClick={() =>
                  setActiveKnowledgeId(activeKnowledgeId === k.id ? null : k.id)
                }
              />
            ))}
          </div>
        </div>
      </div>

      {activeKnowledgeId && (
        <div className="w-[400px] flex-shrink-0">
          <KnowledgeDetail knowledgeId={activeKnowledgeId} onClose={() => setActiveKnowledgeId(null)} />
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: 写知识点卡片 `src/components/knowledge-graph/KnowledgeCard.tsx`**

```typescript
'use client'

import type { KnowledgeNode } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Props {
  knowledge: KnowledgeNode
  isActive: boolean
  onClick: () => void
}

const LEVEL_COLORS: Record<string, string> = {
  chapter: '#475569',
  knowledge: '#0369a1',
  examPoint: '#a16207',
  question: '#b91c1c',
}

export function KnowledgeCard({ knowledge, isActive, onClick }: Props) {
  const examPointCount = knowledge.examPoints?.length ?? 0
  const questionCount =
    knowledge.examPoints?.reduce(
      (sum, ep) => sum + (ep.examQuestions?.length ?? 0),
      0
    ) ?? 0
  const formulaCount = knowledge.formulas?.length ?? 0

  return (
    <div className="flex items-start gap-3 min-w-[200px]">
      <Card
        className={`w-[200px] cursor-pointer transition-shadow hover:shadow-md ${
          isActive ? 'ring-2 ring-blue-400' : ''
        }`}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: LEVEL_COLORS.knowledge }}
            />
            <span className="text-[10px] text-slate-400 uppercase">知识名词</span>
          </div>
          <h3 className="font-semibold text-sm mb-2 leading-tight">{knowledge.name}</h3>
          {knowledge.mnemonic && (
            <p className="text-xs text-slate-500 bg-slate-50 rounded px-2 py-1 mb-2">
              💡 {knowledge.mnemonic}
            </p>
          )}
          <div className="flex flex-wrap gap-1">
            {formulaCount > 0 && (
              <Badge variant="secondary" className="text-[10px]">
                {formulaCount} 公式
              </Badge>
            )}
            {examPointCount > 0 && (
              <Badge
                variant="outline"
                className="text-[10px]"
                style={{ borderColor: LEVEL_COLORS.examPoint, color: LEVEL_COLORS.examPoint }}
              >
                {examPointCount} 考点
              </Badge>
            )}
            {questionCount > 0 && (
              <Badge
                variant="outline"
                className="text-[10px]"
                style={{ borderColor: LEVEL_COLORS.question, color: LEVEL_COLORS.question }}
              >
                {questionCount} 真题
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {examPointCount > 0 && (
        <>
          <span className="text-slate-300 text-lg flex-shrink-0 pt-4">→</span>
          <div className="flex flex-col gap-2 min-w-[180px]">
            {knowledge.examPoints.map((ep) => (
              <Card key={ep.id} className="w-[180px]">
                <CardContent className="p-3 text-xs">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: LEVEL_COLORS.examPoint }}
                    />
                    <span className="text-[10px] text-slate-400">考点</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{ep.description}</p>
                  {ep.examQuestions?.length > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: LEVEL_COLORS.question }}
                      />
                      <span className="text-[10px] text-slate-400">
                        {ep.examQuestions.length} 道真题
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 3: 写知识点详情面板 `src/components/knowledge-graph/KnowledgeDetail.tsx`**

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import type { KnowledgeNode } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { X } from 'lucide-react'

interface Props {
  knowledgeId: number
  onClose: () => void
}

export function KnowledgeDetail({ knowledgeId, onClose }: Props) {
  const { data: knowledge } = useQuery<KnowledgeNode>({
    queryKey: ['knowledge-detail', knowledgeId],
    queryFn: () => fetch(`/api/knowledge/${knowledgeId}`).then((r) => r.json()),
  })

  if (!knowledge) return null

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-semibold text-sm">{knowledge.name}</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1 p-4">
        {knowledge.mnemonic && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-slate-400 mb-1">核心口诀</h4>
            <p className="text-sm bg-amber-50 border-l-2 border-amber-400 px-3 py-2 rounded">
              {knowledge.mnemonic}
            </p>
          </div>
        )}

        {knowledge.detail && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-slate-400 mb-1">详细解释</h4>
            <p className="text-sm text-slate-700 leading-relaxed">{knowledge.detail}</p>
          </div>
        )}

        {knowledge.distinctions && knowledge.distinctions.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-slate-400 mb-1">辨析</h4>
            {knowledge.distinctions.map((d, i) => (
              <div key={i} className="text-sm mb-1">
                <span className="font-medium">{d.title}：</span>
                <span className="text-slate-600">{d.content}</span>
              </div>
            ))}
          </div>
        )}

        {knowledge.formulas && knowledge.formulas.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-slate-400 mb-1">公式</h4>
            {knowledge.formulas.map((f, i) => (
              <div key={i} className="text-sm bg-slate-50 rounded px-3 py-2 mb-1 font-mono">
                <span className="text-slate-400">{f.name}: </span>
                <span>{f.formula}</span>
              </div>
            ))}
          </div>
        )}

        {knowledge.mindMap && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-slate-400 mb-1">思维导图</h4>
            <img src={knowledge.mindMap} alt="思维导图" className="rounded border max-w-full" />
          </div>
        )}

        {knowledge.examPoints?.map((ep) => (
          <div key={ep.id} className="mb-4">
            <h4 className="text-xs font-semibold text-slate-400 mb-1">
              🎯 考点 {ep.category && `· ${ep.category}`}
            </h4>
            <p className="text-sm text-slate-700 mb-2">{ep.description}</p>
            {ep.examQuestions?.map((q) => (
              <div key={q.id} className="border rounded p-3 mb-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded">
                    {q.type}
                  </span>
                </div>
                {q.image && (
                  <img src={q.image} alt="真题" className="rounded mb-2 max-w-full" />
                )}
                {q.content && <p className="text-sm mb-2">{q.content}</p>}
                {q.answer && (
                  <p className="text-xs text-green-600 font-medium">答案：{q.answer}</p>
                )}
                {q.analysis && (
                  <p className="text-xs text-slate-500 mt-1">{q.analysis}</p>
                )}
              </div>
            ))}
          </div>
        ))}
      </ScrollArea>
    </div>
  )
}
```

- [ ] **Step 4: 验证编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/components/knowledge-graph/ && git commit -m "feat: knowledge graph component with cards and detail panel"
```

---

### Task 8: 手动录入表单（动态字段）

**Files:**
- Create: `src/components/input-form/ManualInputForm.tsx`

- [ ] **Step 1: 写动态表单组件 `src/components/input-form/ManualInputForm.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Save } from 'lucide-react'
import { toast } from 'sonner'

interface KeyValue {
  title: string
  content: string
}

interface FormulaItem {
  name: string
  formula: string
}

export function ManualInputForm() {
  const queryClient = useQueryClient()
  const { selectedChapterId } = useAppStore()

  const [name, setName] = useState('')
  const [mnemonic, setMnemonic] = useState('')
  const [detail, setDetail] = useState('')
  const [distinctions, setDistinctions] = useState<KeyValue[]>([{ title: '', content: '' }])
  const [formulas, setFormulas] = useState<FormulaItem[]>([{ name: '', formula: '' }])
  const [submitting, setSubmitting] = useState(false)

  const addDistinction = () => setDistinctions([...distinctions, { title: '', content: '' }])
  const removeDistinction = (i: number) => setDistinctions(distinctions.filter((_, idx) => idx !== i))
  const updateDistinction = (i: number, field: keyof KeyValue, value: string) => {
    const next = [...distinctions]
    next[i] = { ...next[i], [field]: value }
    setDistinctions(next)
  }

  const addFormula = () => setFormulas([...formulas, { name: '', formula: '' }])
  const removeFormula = (i: number) => setFormulas(formulas.filter((_, idx) => idx !== i))
  const updateFormula = (i: number, field: keyof FormulaItem, value: string) => {
    const next = [...formulas]
    next[i] = { ...next[i], [field]: value }
    setFormulas(next)
  }

  const handleSubmit = async () => {
    if (!name.trim()) { toast.error('知识点名称不能为空'); return }
    if (!selectedChapterId) { toast.error('请先在左侧选择章节'); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId: selectedChapterId,
          name: name.trim(),
          mnemonic: mnemonic.trim() || null,
          detail: detail.trim() || null,
          distinctions: distinctions.filter((d) => d.title).length > 0
            ? distinctions.filter((d) => d.title)
            : null,
          formulas: formulas.filter((f) => f.name).length > 0
            ? formulas.filter((f) => f.name)
            : null,
        }),
      })
      if (!res.ok) throw new Error('保存失败')
      toast.success('知识点已保存')
      queryClient.invalidateQueries({ queryKey: ['knowledge'] })
      setName(''); setMnemonic(''); setDetail('')
      setDistinctions([{ title: '', content: '' }])
      setFormulas([{ name: '', formula: '' }])
    } catch {
      toast.error('保存失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">手动录入知识点</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <label className="text-xs text-slate-500">知识点名称 *</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="如：等比修正" />
        </div>
        <div>
          <label className="text-xs text-slate-500">核心口诀</label>
          <Input value={mnemonic} onChange={(e) => setMnemonic(e.target.value)} placeholder="一句话记忆法" />
        </div>
        <div>
          <label className="text-xs text-slate-500">详细解释</label>
          <Textarea value={detail} onChange={(e) => setDetail(e.target.value)} rows={3} placeholder="展开说明..." />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-slate-500">辨析/分类</label>
            <Button variant="ghost" size="sm" onClick={addDistinction}><Plus className="w-3 h-3" /></Button>
          </div>
          {distinctions.map((d, i) => (
            <div key={i} className="flex gap-1 mb-1">
              <Input className="w-1/3 text-xs" placeholder="标题" value={d.title} onChange={(e) => updateDistinction(i, 'title', e.target.value)} />
              <Input className="flex-1 text-xs" placeholder="内容" value={d.content} onChange={(e) => updateDistinction(i, 'content', e.target.value)} />
              <Button variant="ghost" size="icon" onClick={() => removeDistinction(i)}><Trash2 className="w-3 h-3 text-red-400" /></Button>
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-slate-500">公式列表</label>
            <Button variant="ghost" size="sm" onClick={addFormula}><Plus className="w-3 h-3" /></Button>
          </div>
          {formulas.map((f, i) => (
            <div key={i} className="flex gap-1 mb-1">
              <Input className="w-1/3 text-xs font-mono" placeholder="公式名" value={f.name} onChange={(e) => updateFormula(i, 'name', e.target.value)} />
              <Input className="flex-1 text-xs font-mono" placeholder="公式" value={f.formula} onChange={(e) => updateFormula(i, 'formula', e.target.value)} />
              <Button variant="ghost" size="icon" onClick={() => removeFormula(i)}><Trash2 className="w-3 h-3 text-red-400" /></Button>
            </div>
          ))}
        </div>

        <Button onClick={handleSubmit} disabled={submitting} className="w-full">
          <Save className="w-4 h-4 mr-1" />{submitting ? '保存中...' : '保存'}
        </Button>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: 验证编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/input-form/ && git commit -m "feat: manual input form with dynamic fields"
```

---

### Task 9: OCR 面板 + AI 校验（颜色区分版）

**Files:**
- Create: `src/components/ocr-panel/OcrPanel.tsx`
- Create: `src/app/api/ocr/route.ts`

- [ ] **Step 1: 写 OCR API `src/app/api/ocr/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: '未提供图片文件' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    const Tesseract = await import('tesseract.js')
    const { data } = await Tesseract.recognize(buffer, 'chi_sim')

    return NextResponse.json({
      text: data.text.trim(),
      confidence: data.confidence,
      language: 'chi_sim',
    })
  } catch (error) {
    console.error('OCR error:', error)
    return NextResponse.json({ error: 'OCR 识别失败' }, { status: 500 })
  }
}
```

- [ ] **Step 2: 写 OCR 面板组件 `src/components/ocr-panel/OcrPanel.tsx`**

(完整代码略 — 参见计划文件中的完整组件，约 200 行，包含拖拽上传、OCR 调用、AI 模拟校验、颜色标注渲染、逐条接受/拒绝修正、最终保存)

- [ ] **Step 3: 验证编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/ocr/ src/components/ocr-panel/ && git commit -m "feat: OCR panel with color-coded AI correction review"
```

---

### Task 10: AI 对话面板（API Key 模式）

**Files:**
- Create: `src/components/ai-chat/AiChat.tsx`
- Create: `src/app/api/ai/chat/route.ts`
- Create: `src/app/api/config/route.ts`

- [ ] **Step 1: 写 AI 对话 API `src/app/api/ai/chat/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { message, provider, apiKey, model, baseUrl } = await req.json()
  if (!message || !apiKey) {
    return NextResponse.json({ error: '消息和 API Key 不能为空' }, { status: 400 })
  }

  try {
    const response = await fetch(`${baseUrl || 'https://api.deepseek.com'}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一个考编备考助手。根据用户的知识点，帮助识别错别字、补充考点、生成真题、解释概念。回答简洁有条理。',
          },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return NextResponse.json({ error: `AI API 错误: ${err}` }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json({ reply: data.choices[0].message.content })
  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json({ error: 'AI 调用失败' }, { status: 500 })
  }
}
```

- [ ] **Step 2: 写 AI 对话组件 `src/components/ai-chat/AiChat.tsx`**

(完整组件约 100 行，包含消息列表、设置面板、API Key 配置持久化到 AppConfig 表)

- [ ] **Step 3: 写 AppConfig API `src/app/api/config/route.ts`**

```typescript
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
```

- [ ] **Step 4: 验证编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/components/ai-chat/ src/app/api/ai/ src/app/api/config/ && git commit -m "feat: AI chat panel with configurable API key"
```

---

### Task 11: 终端面板（xterm.js）

**Files:**
- Create: `src/components/terminal/TerminalPanel.tsx`

- [ ] **Step 1: 写终端面板组件 `src/components/terminal/TerminalPanel.tsx`**

(约 80 行，包含 xterm.js 渲染、WebSocket 连接本地终端后端、降级方案：按钮唤起系统 CMD)

- [ ] **Step 2: 验证编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/terminal/ && git commit -m "feat: xterm.js terminal panel"
```

---

### Task 12: 集成测试 & 端到端验证

- [ ] **Step 1: 健康检查 API `src/app/api/health/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ status: 'ok', db: 'connected' })
  } catch {
    return NextResponse.json({ status: 'error', db: 'disconnected' }, { status: 500 })
  }
}
```

- [ ] **Step 2: 启动并端到端验证**

```bash
npm run dev
```

验证清单：
1. `http://localhost:3000` — 三栏布局正常显示
2. 左侧创建学科 → 创建章节
3. 手动录入表单 → 保存 → 图谱显示卡片
4. OCR 面板拖入图片 → 识别 → 颜色标注
5. AI 面板输入消息 → 获取回复
6. 终端面板 → 可交互

- [ ] **Step 3: Commit**

```bash
git add src/app/api/health/ && git commit -m "feat: health check API and integration verification"
```

---

### Task 13: 推送 & v0.1.0 标记

- [ ] **Step 1: 推送**

```bash
git push origin main
```

- [ ] **Step 2: 版本标记**

```bash
git tag v0.1.0 -m "考编笔记系统 v0.1.0"
git push origin v0.1.0
```

- [ ] **Step 3: 更新 CHANGELOG.md**

```markdown
## v0.1.0 — 2026-06-02

### Added
- 三栏布局（学科导航 + 知识图谱 + AI/终端面板）
- 4层横向知识图谱（章节 → 知识 → 考点 → 真题）
- 手动录入表单（7类动态字段）
- OCR 截图录入（Tesseract.js 本地识别）
- AI 校验面板（颜色区分 OCR 原文 vs AI 修正）
- AI 对话面板（配置 API Key）
- 内嵌终端面板（xterm.js）
- Prisma + MySQL 数据持久化
```

- [ ] **Step 4: Final commit & push**

```bash
git add CHANGELOG.md && git commit -m "chore: bump to v0.1.0" && git push
```

---

## 附录 A：测试数据种子 (seed.sql)

```sql
USE exam_note;

INSERT INTO subject (id, name) VALUES (1, '行政法');
INSERT INTO chapter (id, subjectId, title, `order`) VALUES (1, 1, '第3章 行政处罚法', 0);

INSERT INTO knowledge (id, chapterId, name, mnemonic, detail, distinctions, formulas) VALUES
(1, 1, '行政处罚的种类', '警告罚没停吊扣', '行政处罚包括：警告、罚款、没收违法所得、责令停产停业、暂扣或吊销许可证、行政拘留等',
 '[{"title":"时间区分","content":"靠前的是基期，靠后的是现期"},{"title":"比字区分","content":"比之前是现期，比之后是基期"}]',
 '[{"name":"基期公式","formula":"基期 = 现期 ÷ (1 + 增长率%)"}]');

INSERT INTO exam_point (id, knowledgeId, description, category) VALUES
(1, 1, '辨析类：哪些行为属于行政处罚 vs 行政强制措施', '辨析类');

INSERT INTO exam_question (id, examPointId, type, content, answer) VALUES
(1, 1, '单选', '下列哪项不属于行政处罚？\nA.罚款\nB.责令停产停业\nC.查封扣押\nD.吊销许可证', 'C');
```

运行: `"D:/Program Files/mysql-5.7.35-winx64/bin/mysql.exe" -u root -proot exam_note < seed.sql`
