# 🐍 Python Fun World

An interactive Python-teaching playground for a 5-year-old child, designed for weekly 20-minute 1:1 lessons over Zoom/iPad.

## What's inside

- **Pixi the robot mascot** — animated SVG, 6 states, speaks aloud with Web Speech API
- **Name onboarding** — welcome screen asks for the child's name, then greets them with *"Very good, [Name]! Let's learn Python together!"* (voice + confetti)
- **Real Python** — a hand-written tree-walking interpreter in TypeScript. No `eval`, no `new Function`, no Pyodide, no Brython, no network. Strict CSP compatible.
- **8 weekly lessons** with voiced instructions — Weeks 1-8 pre-written in `content/lessons.json`
- **10 missions** that check the actual AST (not output substring, so no cheating)
- **20 puzzles** (Guess the Output) with shuffled answers
- **Treasure-chest variable visualizer** — the moment variables "click" for a 5yo
- **Typewriter terminal** with blinking cursor, 28ms/char, and a soft tick every third character
- **Teacher Mode** (PIN 1234) — session cheat-sheet per week, sound/voice toggles, export/reset progress, sticker book
- **15+ synthesized sounds** — no mp3 files, pure Web Audio oscillators
- **PWA** — service worker caches core routes, installs to iPad home screen

## Setup

```bash
pnpm install
pnpm dev
# open http://localhost:3000
```

Then build:

```bash
pnpm build
pnpm start
```

## Deploy to Vercel

1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Click Deploy. Zero config needed.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

## Project structure

```
app/
  layout.tsx            Root layout: persistent TopBar, Pixi overlay, floating shapes
  page.tsx              Welcome + name onboarding
  home/page.tsx         Main tile menu
  play/page.tsx         Free-play playground
  lesson/[week]/page.tsx  One route per week (1–8)
  puzzles/page.tsx      Guess the Output deck
  missions/page.tsx     10 missions with AST checks
  teacher/page.tsx      PIN-gated parent mode
components/
  Pixi.tsx              Animated SVG mascot, 6 states
  TopBar.tsx            Persistent header
  CodeEditor.tsx        Big textarea editor (see "Monaco" below)
  Terminal.tsx          Typewriter output
  VariableBoxes.tsx     Treasure chest visualizer
  LessonPane.tsx        Lesson step framework
  MissionCard.tsx       Mission tile
  PuzzleCard.tsx        Shuffled multiple choice
  InputModal.tsx        Python input() → React modal
  StickerWall.tsx       Earned stickers grid
  FloatingShapes.tsx    Decorative background
  ConfettiBurst.tsx     Confetti helpers
  ServiceWorker.tsx     Registers /sw.js
  Shell.tsx             Layout wrapper
lib/
  python/
    tokenizer.ts        Lexer
    parser.ts           Recursive-descent parser → AST
    interpreter.ts      Tree-walking evaluator
    errors.ts           Kid-friendly error messages
    builtins.ts         print, len, range, random.choice, etc.
    missions.ts         AST-inspection for missions
    index.ts            runPython(code) public API
  sounds.ts             Web Audio oscillator effects
  speak.ts              speechSynthesis wrapper
  store.ts              Zustand store + localStorage persist
content/
  lessons.json          All 8 weeks
  puzzles.json          20 Guess the Output puzzles
  missions.json         10 missions
public/
  favicon.svg           Pixi face
  manifest.webmanifest  PWA
  sw.js                 Service worker
```

## Design decisions

### No Monaco (yet)

The spec asked for Monaco. We ship with a styled `<textarea>` instead for v1:
- Monaco is ~10 MB with workers that complicate the strict CSP and offline caching.
- For a 5-year-old, a big readable font + chunky Run button matters more than IntelliSense.
- Drop-in upgrade path: replace `<textarea>` in `CodeEditor.tsx` with `@monaco-editor/react` later.

### No shadcn CLI

Same philosophy: fewer moving parts. Tailwind + hand-written components in the shadcn style. Install `shadcn-ui` CLI later if the component library grows.

### Hand-written Python interpreter

The spec explicitly forbade `eval` and `new Function` (CSP). We ship a complete tokenizer → parser → tree-walking interpreter in pure TypeScript. Covers:

- `print(...)` with `sep=` / `end=` kwargs
- Arithmetic `+ - * / // %`, precedence, parens, unary `-`
- Strings `"..."` `'...'`, escapes, `+` concat, `*` repeat
- Variables: `name = value`, lookup, reassign
- Lists: `[1, 2, 3]`, indexing (positive + negative)
- Booleans, None
- Comparisons: `< > <= >= == !=`
- `if / elif / else` with 4-space indent
- `for x in range(n)` and `for x in list`
- `while`
- `def name(args):` with `return`
- Built-ins: `str() int() float() len() abs() range() input() random.choice()`
- `#` comments

### Kid-friendly errors

Every raw error is wrapped before it reaches the UI. Examples:
- `print(hello)` → *"I don't know 'hello'. Did you forget the quotes? Like \"hello\" 💬"*
- `prnt("hi")` → *"Did you mean print()? 🤖"*
- Missing `:` after `if` → *"Oops! The computer needs a : after if. Try again! 🧩"*
- `"5" + 5` → *"A word-5 and a number-5 are different. Try str(5) or just numbers!"*

### Voice

Uses the browser's built-in `window.speechSynthesis`. Picks a friendly female voice when available: Samantha, Karen, Google US English, Microsoft Zira, Victoria. Falls back silently when the browser can't or won't speak.

### Accessibility

- All interactive elements have ARIA labels
- Pixi's bubbles are `aria-live="polite"`
- Full keyboard navigation
- `prefers-reduced-motion` respected (animations collapse to opacity fades)
- WCAG AA contrast on all text

## Teacher PIN

Default PIN is **1234**. Change it under `/teacher` → Settings → Change PIN.

## Scripts

- `pnpm dev` — development server
- `pnpm build` — production build
- `pnpm start` — serve production build
- `pnpm lint` — ESLint

## License

MIT — build on it however you like.
