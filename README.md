# 考编笔记 (Exam Note)

结构化知识图谱笔记系统，为考编/公考备考设计。

## 功能

- **4 层知识图谱**：学科 → 章节 → 知识点 → 考点 → 真题
- **双路径录入**：手动表单 + 截图 OCR 导入
- **AI 辅助**：OCR 纠错、AI 对话助手
- **内嵌终端**：xterm.js + node-pty 本地 shell

## 启动

```bash
npm install
# 编辑 .env: DATABASE_URL + AI_API_KEY
node scripts/terminal-server.mjs   # 终端 WebSocket 后端
npm run dev                         # Next.js → http://localhost:3000
```

或一键启动：双击 `scripts/start-dev.bat`

## 技术栈

Next.js 14 · TypeScript · Prisma/MySQL · shadcn/ui · Zustand · React Query · Tesseract.js · xterm.js + node-pty
