<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# main-base-setup

Next.js 16.4.6 App Router template with shadcn/ui (base-nova) and a custom "tuffui" component set. No test suite.

## Commands

- Install: `pnpm install` (`pnpm-lock.yaml` v9; `node_modules/.pnpm` present). A `bun.lock` is also committed, but pnpm is canonical — don't mix managers.
- Dev: `pnpm dev`
- Build (includes tsc): `pnpm build`
- Prod start: `pnpm start`
- Typecheck: `pnpm typecheck`
- Lint: `pnpm lint` (ESLint 9 flat config). It scans the whole tree; untracked `.agents/` skill scripts cause false-positive `react-hooks/rules-of-hooks` errors. For project code use `npx eslint . --ignore-pattern '.agents/**'`. Baseline: 0 errors, 1 warning (unused `Geist` in `app/layout.tsx`).
- Format: `pnpm format` (Prettier, 2 spaces, no semis, double quotes, 80 cols, LF, Tailwind class sorting via `app/globals.css`).

## Structure

- `app/` — App Router routes/layouts; `app/globals.css` is the Tailwind v4 theme (CSS-first, no `tailwind.config`).
- `components/ui/` — canonical components. `components/comps/` is an unused duplicate (`json-viewer`) — don't edit it.
- `components/theme-provider.tsx` — next-themes wrapper + `d` hotkey for dark mode.
- `lib/utils.ts` — re-exports `cn` from the `cn` package. `lib/motion-tokens.ts` — shared easing/spring constants.
- `hooks/use-mock-run.ts` — scripted demo state player; demos only.
- `@/*` maps to the project root.

## Conventions / gotchas

- Icons: use `@phosphor-icons/react`, not lucide, despite `components.json` declaring lucide.
- Tailwind v4 is CSS-first; theme tokens live in `app/globals.css`.
- RTL: `components.json` sets `rtl: true`. Use logical properties (`ms/me/ps/pe`, `start/end`), not physical `ml/mr/pl/pr`. Exception: JSON content is forced `dir="ltr"`.
- `cn`: import from `@/lib/utils` (canonical). `button.tsx`/`card.tsx` import from `"cn"` directly — don't spread that pattern.
- Motion: `motion/react`; use tokens from `@/lib/motion-tokens`; honor reduced motion (`MotionConfig reducedMotion="user"`).
- Dark mode: class strategy via next-themes; `d` key toggles unless focus is in an input/textarea/contentEditable.
- shadcn: `npx shadcn@latest add <name>` into `components/`. Style base-nova, RSC. Mixed primitives: `button.tsx` uses `@base-ui/react`, overlays use `radix-ui` — match the existing component's library when editing.
- No tests in repo; verify with typecheck + lint + build.
- `.agents/` and `skills-lock.json` are local, untracked skill installs — not project source; do not commit.