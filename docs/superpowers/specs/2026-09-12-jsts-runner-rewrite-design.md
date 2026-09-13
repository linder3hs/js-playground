# JS/TS Runner Rewrite — Design

Date: 2026-09-12
Route: `/playground/js-ts`

## Goal

Rewrite the JS/TS playground runner so it: runs TypeScript as well as JavaScript, gives real language autocomplete, surfaces syntax errors while typing, and executes automatically without pressing Run.

## Problems in the current runner

1. `components/editor/monaco-editor.tsx` reads the store directly and ignores `use-editor`'s `handleEditorDidMount`. The Ctrl+Enter action and the `extraLib` registered there are dead code.
2. Both files call `addExtraLib` with their own `interface Console`, which shadows `lib.dom`'s definition. This is why console autocomplete is poor (no `table`, `dir`, `time`, `assert`).
3. The editor is pinned to `defaultLanguage="javascript"` with no model URI, so there is no TS emit and no real diagnostics.
4. `executeCode` runs user code with `new Function` on the main thread. Under auto-run this is fatal: every keystroke executes half-written code, and one `while (true)` freezes the tab permanently.
5. Value paths are `root[0]` for every console entry, so expanding a node in one entry expands the same path in others.

## Decisions

- **Execution moves to a Web Worker.** Disposable, with a 2s parent-side `terminate()` timeout. An infinite loop kills the worker, not the page. A new run cancels the in-flight one.
  - Accepted cost: values cross serialized, so `console` output is serialized eagerly in the worker instead of walked lazily in the viewer.
  - Accepted cost: user code loses `window`, `document`, `localStorage`, `alert`.
- **Auto-run with a toggle**, debounced ~700ms, skipped when the code has syntax errors. Run button stays as manual trigger; Ctrl+Enter starts working.
- **TypeScript, autocomplete and diagnostics all come from Monaco's bundled TS worker.** No new dependency. `getEmitOutput()` transpiles, `getSyntacticDiagnostics()`/`getSemanticDiagnostics()` report errors, and deleting the broken `extraLib` restores native completions.

## Architecture

New module `src/lib/runner/`:

| File | Responsibility |
|---|---|
| `protocol.ts` | Message types between page and worker |
| `serialize.ts` | Live value → `ProcessedValue` tree, eager, cycle-safe, clone-safe |
| `runner.worker.ts` | Runs compiled JS with an injected console, posts serialized entries |
| `client.ts` | `CodeRunner`: worker lifecycle, run cancellation, timeout |
| `compile.ts` | Monaco TS worker: emit JS + collect diagnostics |

Flow: keystroke → debounce → `compile()` → syntax errors? mark and stop → `runner.run(js)` → worker posts console events → `use-console` renders.

## Changes to existing files

- `components/console/types.ts`: `ProcessedValue` gains `children?: ProcessedValue[]`.
- `ConsoleValueViewer`: renders `value.children` instead of calling `processChildren` on a live object.
- `use-console.ts`: gains `addProcessedOutput(level, values, stack)` for values already serialized by the worker.
- `use-editor.ts`: owns compile + debounce + runner client + diagnostics; drops `executeCode`.
- `components/editor/monaco-editor.tsx`: becomes a presentational component driven by `use-editor` props.
- `store/editor-store.ts`: default `index.ts` file, `setCurrentFile`, persisted `autoRun`. Language is derived from the current file's extension.
- `workspace.tsx`: JS/TS switch, auto-run toggle, problem count in the status bar.
- `lib/utils/code-executor.ts`: deleted — replaced by the worker.

## Verification

- `while (true) {}` → worker terminated at 2s, UI responsive, error entry in console.
- `const x: number = "a"` in TS mode → red marker, no execution.
- `console.log(new Map([[1, { a: 2 }]]))` → expands as before.
- Fast typing → one run after the pause, not one per keystroke.
- Reload → code, language and auto-run setting persist.

## Implementation notes (deviations found while building)

- **JavaScript is not transpiled.** Monaco's JavaScript worker returns an empty
  `outputFiles` list from `getEmitOutput()`, and JS needs no transpiling anyway.
  Only TypeScript goes through the emit path; JS runs `model.getValue()` directly.
- **`lib` is left at Monaco's default** (which includes DOM) rather than restricted
  to the worker's real globals. Restricting it is what gives an accurate runtime
  surface, but the default is what gives the complete language autocomplete the
  rewrite was asked for. Consequence: `document` autocompletes but is undefined at
  runtime.
- **The first auto-run is gated on `isEditorReady`.** Monaco loads from a CDN, so
  the initial debounce fires before a model exists; without the gate nothing ever
  runs until the first keystroke.
