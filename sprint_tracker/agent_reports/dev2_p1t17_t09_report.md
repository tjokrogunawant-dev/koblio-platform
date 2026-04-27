# Dev Agent 2 Report — P1-T17 + P1-T09

**Tasks:** KaTeX Math Rendering (P1-T17) + Sentry Error Tracking (P1-T09)
**Status:** Done
**Branch:** master
**Commit:** (see git log)

---

## P1-T17: KaTeX

### What was implemented

- Installed `katex@^0.16.11`, `react-katex@^3.0.1`, and `@types/katex@^0.16.7` in both `packages/ui` and `apps/web` package.json files (no pnpm install run — dependency declarations only).
- Created a `MathRenderer` React component with an error boundary that falls back to `<code>` on render failure.
- Supports both inline (`<InlineMath>`) and block/display (`<BlockMath>`) rendering via a `display` prop.
- Exported `MathRenderer` and `MathRendererProps` from `packages/ui/src/index.ts`.
- Added a "Math Rendering Demo" card section to the dashboard page (`apps/web/src/app/dashboard/page.tsx`) showing three expressions: `x^2 + y^2 = z^2`, the quadratic formula, and `\sqrt{16} = 4`.

### Files changed

- `packages/ui/src/math-renderer.tsx` (new)
- `packages/ui/src/index.ts` (appended exports)
- `packages/ui/package.json` (added katex, react-katex, @types/katex)
- `apps/web/package.json` (added katex, react-katex, @types/katex)
- `apps/web/src/app/dashboard/page.tsx` (added MathRenderer demo section)

### Tests written

- `apps/web/src/__tests__/math-renderer.test.tsx`
- Mocks `react-katex` (InlineMath/BlockMath) and `katex/dist/katex.min.css` for jsdom compatibility.
- Tests: renders inline math, renders block math when `display=true`, applies custom className, defaults to inline mode.

---

## P1-T09: Sentry

### What was implemented

**Web (Next.js):**
- Added `@sentry/nextjs@^8` to `apps/web/package.json` dependencies.
- Created `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` — all read DSN and env from environment variables only.
- Wrapped `nextConfig` in `withSentryConfig` in `apps/web/next.config.ts`.
- Appended `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT` to `apps/web/.env.example`.

**API (NestJS):**
- Added `@sentry/nestjs@^8` and `@sentry/profiling-node@^8` to `apps/api/package.json` dependencies.
- Created `apps/api/src/instrument.ts` with `Sentry.init()` including the node profiling integration.
- Added `import './instrument'` as the very first import in `apps/api/src/main.ts`.
- Added `SentryModule.forRoot()` as the first entry in the `AppModule` imports array in `apps/api/src/app.module.ts`.
- Appended `SENTRY_DSN=` to `apps/api/.env.example`.

### Files changed

- `apps/web/sentry.client.config.ts` (new)
- `apps/web/sentry.server.config.ts` (new)
- `apps/web/sentry.edge.config.ts` (new)
- `apps/web/next.config.ts` (wrapped with withSentryConfig)
- `apps/web/package.json` (added @sentry/nextjs)
- `apps/web/.env.example` (appended Sentry vars)
- `apps/api/src/instrument.ts` (new)
- `apps/api/src/main.ts` (prepended import './instrument')
- `apps/api/src/app.module.ts` (added SentryModule.forRoot() import and usage)
- `apps/api/package.json` (added @sentry/nestjs, @sentry/profiling-node)
- `apps/api/.env.example` (appended SENTRY_DSN)

---

## Decisions & trade-offs

- `MathRenderer` lives in `packages/ui/src/` (flat, matching the existing component layout) rather than a `components/` subdirectory, consistent with the rest of the UI package.
- The error boundary renders the raw LaTeX expression in a red `<code>` tag on failure — better than crashing silently for K-6 students.
- Sentry `tracesSampleRate` is set to `0.1` in production and `1.0` in development/test to keep costs low at scale.
- `profilesSampleRate` is set to `1.0` on the API; can be tuned down once baseline performance data is collected.
- No real DSNs are hardcoded anywhere — all values come from env vars.

## Issues / known gaps

- `pnpm install` has not been run (per task instructions). Packages will not resolve until the monorepo workspace install is executed.
- `react-katex` v3 is currently unmaintained; if type errors appear at install time, switching to direct `katex` usage with a thin wrapper is the fallback path.
- The `withSentryConfig` `org` and `project` fields accept `string | undefined` in TS; the Sentry CLI will silently skip source map upload if they are not set, which is the safe default for local dev.
