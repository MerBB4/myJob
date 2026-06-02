# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run Commands

```bash
npm run dev          # Start Next.js dev server on :3000
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint (next/core-web-vitals + next/typescript)

# Database
npx prisma generate  # Regenerate Prisma Client after schema changes
npx prisma db push   # Push schema to MySQL (no migration file)
npx prisma studio    # Open Prisma data browser GUI

# Terminal (required for embedded xterm)
node scripts/terminal-server.mjs   # WebSocket shell server on :3001
# Or use the all-in-one launcher: scripts/start-dev.bat / start-dev.ps1
```

## Architecture

**Stack:** Next.js 14 App Router + Prisma/MySQL + Zustand + React Query + @base-ui/react + Tailwind + shadcn-ui

### Layout & Component Tree

```
RootLayout (Server) → Providers (QueryClient + Toaster)
  └─ Home Page (Client)
       ├─ TopBar          — Subject pills, view mode toggle, OCR/terminal buttons
       ├─ LeftSidebar     — Chapter list for selected subject, resizable (180-320px)
       ├─ MainContent     — View router: graph | list(待实现) | quiz(待实现) | OCR panel
       │    ├─ KnowledgeGraph → KnowledgeCard[] + KnowledgeDetail (320px detail panel)
       │    └─ OcrPanel     — Upload → AI review → Form submit (3-stage flow)
       ├─ RightPanel      — AiChat (300px, resizable 260-440px)
       └─ TerminalPanel   — xterm.js + WebSocket → node-pty shell, toggleable bottom panel
```

### Data Model (Prisma → MySQL)

```
Subject ──< Chapter ──< Knowledge ──< ExamPoint ──< ExamQuestion
  1:*         1:*         1:*           1:*             (4-level cascade)
                                                      AppConfig (key-value store)
```

- **Knowledge** stores `distinctions` and `formulas` as JSON arrays
- All relations use `onDelete: Cascade`
- `AppConfig` is a generic key-value table (used for AI settings persistence)

### State Management Split

| Concern | Tool | What it holds |
|---------|------|---------------|
| UI state | **Zustand** (`src/lib/store.ts`) | selectedSubjectId, selectedChapterId, viewMode, showTerminal, showOcrPanel |
| Server state | **React Query** (`@tanstack/react-query`) | subjects list, knowledge items, AI config — fetched/cached via API routes |

### API Routes (all under `src/app/api/`)

| Route | Methods | Notes |
|-------|---------|-------|
| `/api/subjects` | GET, POST | GET returns full nested tree with computed counts |
| `/api/subjects/[id]` | PUT, DELETE | |
| `/api/chapters` | POST | Auto-calculates `order` |
| `/api/chapters/[id]` | PUT, DELETE | |
| `/api/knowledge` | GET, POST | GET filters by `?chapterId=`, includes nested examPoints→examQuestions |
| `/api/knowledge/[id]` | GET, PUT, DELETE | |
| `/api/exam-points` | POST | |
| `/api/exam-points/[id]` | PUT, DELETE | |
| `/api/exam-questions` | POST | |
| `/api/exam-questions/[id]` | PUT, DELETE | |
| `/api/ai/chat` | POST | Proxies to configured LLM (reads AI_API_KEY/BASE_URL/MODEL from env) |
| `/api/ocr` | POST | Multipart image → Tesseract.js `chi_sim` → text |
| `/api/config` | GET, POST | AppConfig key-value CRUD (used by AiChat settings) |
| `/api/health` | GET | `SELECT 1` DB check |

## Key Patterns

- **UI library:** shadcn-ui components live in `src/components/ui/`, built on `@base-ui/react` headless primitives (NOT Radix). Import from `@/components/ui/xxx`.
- **Styling:** `cn()` from `@/lib/utils` merges Tailwind classes via clsx + tailwind-merge. Design tokens in `globals.css` use MD3-style naming (`--surface`, `--on-surface`, `--accent`). Custom animations: `fadeIn/Out`, `slideDown/Up`, `slideOutDown/Up`, `slideInRight/OutRight`. All respect `prefers-reduced-motion`.
- **Exit animations:** `useAnimateExit()` hook in `src/lib/use-animate-exit.ts` — shows element immediately on `visible=true`, applies exit class then unmounts on `visible=false`.
- **Z-Index scale:** CSS variables `--z-base:0`, `--z-panel:10`, `--z-overlay:30`, `--z-modal:50`, `--z-toast:100`. No hardcoded z-index values.
- **Terminal:** Kept mounted even when hidden (`h-0 overflow-hidden`) to avoid WebSocket reconnect on toggle.
- **Store persistence:** Zustand persists `selectedSubjectId` and `viewMode` to localStorage via `zustand/middleware/persist`.
- **Module alias:** `@/*` maps to `./src/*` (tsconfig paths).
- **Prisma singleton:** `src/lib/db.ts` stores the client on `globalThis` to survive Next.js hot reload.
- **Dynamic imports:** `KnowledgeGraph` and `OcrPanel` are `next/dynamic(() => ..., { ssr: false })` in MainContent — they use browser APIs.
- **Terminal architecture:** Browser xterm.js → WebSocket `ws://hostname:3001` → Node.js `node-pty` spawning a real shell process. The WS server is `scripts/terminal-server.mjs`.
- **AI chat:** System prompt is hardcoded in `src/app/api/ai/chat/route.ts` as "你是一个专业的考编备考助手". Settings (model, base URL) stored in AppConfig and also read from env vars.

## Configuration

- `.env` — `DATABASE_URL` (MySQL), `AI_API_KEY`, `AI_MODEL`, `AI_BASE_URL`
- `tailwind.config.ts` — Custom colors (`surface`, `on-surface`, `accent`, `chapter/knowledge/exam-point/exam-question`), fluid `clamp()` font sizes, custom shadows (`ambient`, `elevated`), `topbar` spacing (48px)
- `components.json` — shadcn-ui config, style: `base-nova`, RSC enabled, icon library: lucide

## Known Issues

1. **OCR "AI review" is simulated**: `simulateAiReview()` in OcrPanel uses hardcoded regex, not a real LLM call
2. **No authentication**: Single-user local app, no auth middleware or user model
3. **`list` and `quiz` view modes**: Placeholder stubs in MainContent, not implemented
