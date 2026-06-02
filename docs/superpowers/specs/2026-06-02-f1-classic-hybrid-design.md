# F1 Classic Hybrid Redesign

**Date:** 2026-06-02
**Based on:** F1 Classic Hybrid (A2 Ink & Scholar + A1 Scholarly Study)
**Status:** Implementing

## Design Direction

Warm paper tones + scholarly ink-brush aesthetics. Georgia serif headings, system-ui body, Chinese character watermarks, left colored border bars on knowledge cards.

## Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--ink` | `#3d3226` | Primary text |
| `--ink-muted` | `#8b7b6a` | Secondary text |
| `--paper` | `#fefdf9` | Page background |
| `--paper-dim` | `#f8f4ec` | Card area bg |
| `--accent` | `#8b7355` | Primary accent (warm brown) |
| `--accent-2` | `#a0522d` | Exam points (sienna) |
| `--accent-3` | `#2d6a4f` | Exam questions (pine) |
| `--gold-pale` | `#d4c8b0` | Borders, dividers |
| `--gold-light` | `#c4a882` | Numbers, watermarks |
| `--white` | `#ffffff` | Card surface |

## Typography

| Role | Font | Size |
|------|------|------|
| Subject titles | Georgia 700 | 18px |
| Knowledge names | Georgia 600 | 13px |
| Body / UI | system-ui | 12-14px |
| Descriptions | system-ui | 10-11px |
| Numbers | Georgia 700 | 16px |
| Tags | system-ui | 9px |

## Motion

| Level | Duration | Curve |
|-------|----------|-------|
| Atomic (hover/press) | 120ms | ease / ease-spring |
| Module (card/panel/dropdown) | 200ms | ease-out |
| Page (modal/overlay) | 300ms | ease-out |

ease-out: cubic-bezier(0.16, 1, 0.3, 1)
ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)

## Implementation

### Done
- Phase 1: Design tokens (globals.css, tailwind.config.ts)
- Phase 2: Animation system (motion tokens, interactive utilities, exit animations)
- Phase 3: UI components (Dialog, Select, Tooltip z-index/color fixes)

### Pending
- Phase 4: Apply F1 theme to layout components
- Phase 5: Polish (centered toast, list stagger, watermarks)
