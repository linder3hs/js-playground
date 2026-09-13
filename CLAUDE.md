# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **yarn** (`yarn.lock` is the tracked lockfile; ignore the stray `package-lock.json`).

```bash
yarn dev        # next dev on :3000
yarn build      # next build
yarn start      # serve production build
yarn lint       # next lint
npx tsc --noEmit  # type check
```

There is no test suite.

`next.config.ts` sets `eslint.ignoreDuringBuilds` and `typescript.ignoreBuildErrors`, so **a green `yarn build` proves nothing about types or lint** — run `yarn lint` and `npx tsc --noEmit` separately. `tsconfig.json` also has `strict: false` and `noImplicitAny: false`.

Env vars (GitHub OAuth, needed only for sign-in): `GITHUB_ID`, `GITHUB_SECRET`, plus the usual `NEXTAUTH_URL` / `NEXTAUTH_SECRET`.

## Architecture

Next.js 15 App Router + React 19 RC, TypeScript, Tailwind + shadcn/ui (`src/components/ui`), Zustand for state, Monaco for every editor. Path alias `@/*` → `./src/*`. All playgrounds are client-side; the only server code is the NextAuth route.

### Four playgrounds, one shape

Each playground is `route page → feature component → hook (all state + Monaco setup) → optional persisted Zustand store`. The hook is where the real logic lives; the component is layout + `ResizablePanelGroup`.

| Playground | Route | Component | Hook | Store |
|---|---|---|---|---|
| JS/TS | `/playground/js-ts` (`src/app/(app)/`) | `components/layout/workspace.tsx` | `hooks/use-editor.ts` + `use-console.ts` | `store/editor-store.ts` |
| Web (HTML/CSS/JS) | `/playground/web` | `src/web-playground/` | `hooks/use-web-playground.ts` | `store/web-playground-store.ts` |
| Markdown | `/playground/markdown` | `src/markdown-playground/` | `hooks/use-markdown-playground.ts` | — |
| JSON | `/playground/json` | `src/json-playground/` | `hooks/use-json-playground.ts` | — |

Note the JS/TS route lives in the `(app)` route group while the others are plain `app/playground/*` — there is no shared playground layout.

### Execution models (they differ per playground)

- **JS/TS**: `lib/utils/code-executor.ts` wraps user code in an async IIFE string and runs it with `new Function` **in the main window** — not a worker, not an iframe. A `customConsole` object is injected so `console.*` calls are captured as typed `ConsoleOutput` entries instead of hitting the real console. Values are passed through unserialized, which is what lets `ConsoleValueViewer` render live objects/Maps/Sets.
- **Web**: the hook builds one HTML document from the three files and assigns it to `previewRef.current.srcdoc` on an `<iframe sandbox="allow-scripts">`.
- **Markdown**: preview HTML comes from a **hand-rolled regex converter** inside `use-markdown-playground.ts` (no markdown library). Fixing markdown bugs means editing those regexes, in order — they run sequentially and later rules depend on earlier ones.

### Persistence and sharing

Both stores use `zustand/middleware` `persist` to localStorage (`js-playground-storage`, `web-playground-storage`), so editor content survives reloads and there is no backend. Sharing is `lib/utils/share.ts`: base64-encode the code into the URL; `/playground/shared/[code]` decodes it, writes it into the editor store, and redirects to `/playground/js-ts`.

### Auth

NextAuth v4 GitHub provider at `app/api/auth/[...nextauth]/route.ts`, requesting `repo gist` scope and exposing the raw `accessToken` on the session (for Octokit / gist features). `src/middleware.ts` only redirects stale `/es`, `/fr`, `/de` paths to `/`; it does not guard anything.

## Conventions

- Components are either `ComponentName/component-name.tsx` + `index.ts` barrel, or a flat `kebab-case.tsx` in the folder. Follow whichever the sibling files use.
- Comments in the existing code are largely in Spanish; match the file you are editing.
- `src/web-playground/hooks/useWebPlayground.ts` is an unused duplicate — the live hook is `src/hooks/use-web-playground.ts`. Check imports before editing either.
