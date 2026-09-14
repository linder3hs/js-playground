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

### Three playgrounds, one shape

Each playground is `route page → feature component → hook (all state + Monaco setup) → optional persisted Zustand store`. The hook is where the real logic lives; the component is layout + `ResizablePanelGroup`.

| Playground | Route | Component | Hook | Store |
|---|---|---|---|---|
| JS/TS | `/playground/js-ts` (`src/app/(app)/`) | `components/layout/workspace.tsx` | `hooks/use-editor.ts` + `use-console.ts` | `store/editor-store.ts` |
| Markdown | `/playground/markdown` | `src/markdown-playground/` | `hooks/use-markdown-playground.ts` | — |
| JSON | `/playground/json` | `src/json-playground/` | `hooks/use-json-playground.ts` | — |

All three share the same chrome: `components/editor/playground-header.tsx` (44px bar, brand, zinc palette, orange only on hover) and the Monaco themes exported from `components/editor/monaco-editor.tsx`. Match it when adding a screen.

Note the JS/TS route lives in the `(app)` route group while the others are plain `app/playground/*` — there is no shared playground layout.

### Execution models (they differ per playground)

- **JS/TS**: `lib/runner/` owns execution. `compile.ts` transpiles through the TypeScript worker Monaco already loads, `client.ts` owns the worker lifecycle (a new run kills the one in flight; the timeout is a `terminate()`), and `runner.worker.ts` runs the transpiled JS with an injected `console`. Values cross the worker boundary already serialized by `serialize.ts`, so `ConsoleValueViewer` renders trees, not live objects.
- **Markdown**: `marked` with GFM, configured in `use-markdown-playground.ts`; its `code` renderer highlights through `prismjs`. The preview is injected with `innerHTML` and **not sanitized** — fine while the content is only what the local user typed, but a share link for markdown would need DOMPurify first.
- **JSON**: `lib/utils/json-formatter.ts` builds **one level** of the tree per call; `JsonTreeView` asks for children on expand. Paths are JSON Pointers (RFC 6901), so keys containing dots or slashes do not collide.

### Persistence and sharing

`store/editor-store.ts` uses `zustand/middleware` `persist` to localStorage (`js-playground-storage`), so editor content survives reloads and there is no backend. Markdown and JSON keep their state in the hook only. Sharing is `lib/utils/share.ts`: base64-encode the code into the URL; `/playground/shared/[code]` decodes it, writes it into the editor store, and redirects to `/playground/js-ts`.

### Auth

NextAuth v4 GitHub provider at `app/api/auth/[...nextauth]/route.ts`, requesting `repo gist` scope and exposing the raw `accessToken` on the session (for Octokit / gist features). `src/middleware.ts` only redirects stale `/es`, `/fr`, `/de` paths to `/`; it does not guard anything.

## Conventions

- Components are either `ComponentName/component-name.tsx` + `index.ts` barrel, or a flat `kebab-case.tsx` in the folder. Follow whichever the sibling files use.
- **Code and comments are English only.** Identifiers, comments, JSDoc, commit messages and UI strings all in English, with no exceptions — the codebase used to mix Spanish comments in and it was translated wholesale.
- Comments explain *why*, not *what*: the constraint, the bug that forced the shape, the thing that broke last time. Skip the ones restating the line below them.
