"use client";

import { Editor, loader, type BeforeMount, type OnMount } from "@monaco-editor/react";
import type { EditorConfig } from "@/lib/types";
import type { PlaygroundLanguage } from "@/store/editor-store";
import { FILE_BY_LANGUAGE } from "@/store/editor-store";

/**
 * `@monaco-editor/react` loads Monaco 0.43 (September 2023) by default, and
 * with it an old TypeScript: methods like `toSorted` or `Object.groupBy` were
 * reported as non-existent even though the browser supports them.
 *
 * 0.52.2 is the last version that ships the AMD bundle under `min/vs`, which
 * is what this loader needs. From 0.53 on that file is a 2 KB ESM shim and the
 * editor never mounts.
 */
loader.config({
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs",
  },
});

/**
 * Themes aligned with the site background, so the editor does not read as a
 * box pasted on top of the page.
 *
 * They are applied through the component's `theme` prop, not with
 * `monaco.editor.setTheme()`: the library reapplies its prop after mount and
 * would overwrite any manual call.
 */
export const THEMES = {
  dark: {
    name: "playground-dark",
    base: "vs-dark" as const,
    colors: {
      "editor.background": "#0A0A0B",
      "editorGutter.background": "#0A0A0B",
      "editor.lineHighlightBackground": "#18181B",
      "editorLineNumber.foreground": "#52525B",
    },
  },
  light: {
    name: "playground-light",
    base: "vs" as const,
    colors: {
      "editor.background": "#FFFFFF",
      "editorGutter.background": "#FFFFFF",
      "editor.lineHighlightBackground": "#F4F4F5",
      "editorLineNumber.foreground": "#A1A1AA",
    },
  },
};

export const defineThemes: BeforeMount = (monaco) => {
  for (const theme of Object.values(THEMES)) {
    monaco.editor.defineTheme(theme.name, {
      base: theme.base,
      inherit: true,
      rules: [],
      colors: theme.colors,
    });
  }
};

interface MonacoEditorProps {
  value: string;
  language: PlaygroundLanguage;
  config: EditorConfig;
  theme: "light" | "dark";
  onChange: (value: string | undefined) => void;
  onMount: OnMount;
}

/**
 * Presentational editor: all state and language configuration live in
 * `use-editor`. This component used to read the store on its own and ignore
 * the hook, which left the Ctrl+Enter shortcut with no effect.
 *
 * `path` matters: it gives the model a URI with an extension, and without one
 * the TypeScript worker neither transpiles nor reports diagnostics.
 */
export const MonacoEditor = ({
  value,
  language,
  config,
  theme,
  onChange,
  onMount,
}: MonacoEditorProps) => (
  <Editor
    height="100%"
    language={language}
    theme={THEMES[theme].name}
    beforeMount={defineThemes}
    path={`file:///${FILE_BY_LANGUAGE[language]}`}
    value={value}
    onChange={onChange}
    onMount={onMount}
    options={{
      automaticLayout: true,
      minimap: { enabled: config.minimap },
      fontSize: config.fontSize,
      lineNumbers: config.lineNumbers,
      wordWrap: config.wordWrap,
      tabSize: config.tabSize,
      scrollBeyondLastLine: false,
      formatOnPaste: true,
      formatOnType: true,
      // Eager autocomplete: this is a playground, not a noisy IDE.
      quickSuggestions: true,
      suggestOnTriggerCharacters: true,
      tabCompletion: "on",
    }}
  />
);
