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
# Or use the all-in-one launcher: scripts/start-dev.bat
```

## Architecture

**Stack:** Next.js 14 App Router + Prisma/MySQL + Zustand + React Query + @base-ui/react + Tailwind + shadcn-ui

### Layout & Component Tree

```
RootLayout (Server) → Providers (QueryClient + Toaster)
  └─ Home Page (Client)
       ├─ TopBar          — Subject pills, view mode toggle, OCR/terminal buttons
       ├─ LeftSidebar     — Chapter list for selected subject, resizable (180-320px)
       ├─ MainContent     — View router: graph | list(TODO) | quiz(TODO) | OCR panel
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

- Zustand persists `selectedSubjectId` and `viewMode` to localStorage (key: `exam-note-ui-state`)
- `selectedChapterId`, `showTerminal`, `showOcrPanel` are NOT persisted (ephemeral session state)

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
| `/api/ai/chat` | POST | Proxies to LLM (reads AI_API_KEY/MODEL/BASE_URL from env, 30s AbortController timeout) |
| `/api/ocr` | POST | Multipart image → Tesseract.js `chi_sim` → text |
| `/api/config` | GET, POST | AppConfig key-value CRUD (used by AiChat for model/URL settings) |
| `/api/health` | GET | `SELECT 1` DB check |

## Key Patterns

- **Design system:** F1 Classic Hybrid — warm paper-ink palette. CSS variables in `globals.css`: `--paper` (`#fefdf9` background), `--ink` (`#3d3226` text), `--accent` (`#8b7355` brown), `--paper-dim` (`#f8f4ec` sidebar). Legacy `--surface`/`--on-surface` tokens alias to these for backwards compatibility. Font: Georgia + Noto Serif SC + PingFang SC.
- **shadcn compat:** `globals.css` provides HSL-based `--background`/`--foreground`/`--primary`/etc tokens so shadcn-ui components render correctly in the F1 palette.
- **UI library:** shadcn-ui components in `src/components/ui/`, built on `@base-ui/react` headless primitives (NOT Radix). Import from `@/components/ui/xxx`.
- **Class merging:** `cn()` from `@/lib/utils` = `clsx` + `tailwind-merge`.
- **Exit animations:** `useAnimateExit()` in `src/lib/use-animate-exit.ts` — shows element on `visible=true` with enter animation; on `visible=false`, applies exit animation then unmounts after `exitMs` delay (default 150ms). Used in AiChat settings panel.
- **Global interactive system:** `globals.css` provides reusable interaction classes: `.interactive` (hover/active/focus-visible), `.interactive-card` (hover lift + shadow), `.interactive-press` (scale-down on click), `.interactive-pill` (rounded button hover fill), `.interactive-list-item` (subtle bg sweep), `.interactive-dropzone` (drag-file border pulse).
- **Z-Index scale:** CSS variables `--z-base:0`, `--z-panel:10`, `--z-overlay:30`, `--z-modal:50`, `--z-toast:100`. No hardcoded z-index.
- **GPU acceleration:** `.gpu` utility class (`will-change: transform; transform: translateZ(0)`) for animation-heavy elements.
- **Motion tokens:** `--duration-fast:120ms`, `--duration-base:200ms`, `--duration-slow:300ms`, `--ease-spring` (overshoot), `--ease-in-out`, `--ease-out`.
- **Terminal architecture:** Browser xterm.js → WebSocket `ws://hostname:3001` → Node.js `node-pty` spawning a real PowerShell/shell process. WS server: `scripts/terminal-server.mjs`. Terminal is conditionally rendered (`{showTerminal && ...}`) — unmounts on hide, WebSocket reconnects on show.
- **Module alias:** `@/*` maps to `./src/*` (tsconfig paths).
- **Prisma singleton:** `src/lib/db.ts` stores the client on `globalThis` to survive Next.js hot reload.
- **Dynamic imports:** `KnowledgeGraph` and `OcrPanel` are `next/dynamic(() => ..., { ssr: false })` in MainContent — they use browser APIs (canvas, file drag-drop).
- **AI chat:** System prompt hardcoded in `src/app/api/ai/chat/route.ts` as "你是一个专业的考编备考助手". 30s AbortController timeout prevents hanging requests. Model and base URL stored in AppConfig (persisted via settings UI) and also fall back to env vars.

## Configuration

- `.env` — `DATABASE_URL` (MySQL), `AI_API_KEY`, `AI_MODEL`, `AI_BASE_URL`
- `tailwind.config.ts` — Custom colors (`surface`, `on-surface`, `accent`, `chapter`/`knowledge`/`exam-point`/`exam-question`), shadcn HSL compat tokens (`background`, `foreground`, `primary`, `secondary`, `muted`, `destructive`, `card`, `popover`, `ring`, `input`), fluid `clamp()` font sizes, custom shadows (`ambient`, `elevated`), `topbar` spacing (48px)
- `components.json` — shadcn-ui config, style: `base-nova`, RSC enabled, icon library: lucide

## Known Issues

1. **OCR "AI review" is simulated**: `simulateAiReview()` in OcrPanel uses hardcoded regex, not a real LLM call
2. **No authentication**: Single-user local app, no auth middleware or user model
3. **`list` and `quiz` view modes**: Placeholder stubs in MainContent, not implemented
4. **Terminal unmounts on hide**: WebSocket reconnects on every toggle — consider keeping mounted with `h-0 overflow-hidden` to avoid reconnect overhead
5. **No test suite**: Zero test files in the project
