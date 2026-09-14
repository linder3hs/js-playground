"use client";

import { Editor, loader, type BeforeMount, type OnMount } from "@monaco-editor/react";
import type { EditorConfig } from "@/lib/types";
import type { PlaygroundLanguage } from "@/store/editor-store";
import { FILE_BY_LANGUAGE } from "@/store/editor-store";

/**
 * `@monaco-editor/react` carga Monaco 0.43 (septiembre 2023) por defecto, y
 * con él un TypeScript viejo: métodos como `toSorted` u `Object.groupBy` se
 * reportaban como inexistentes aunque el navegador los soporte.
 *
 * 0.52.2 es la última versión que publica el bundle AMD en `min/vs`, que es
 * lo que este loader necesita. A partir de 0.53 ese archivo es un shim ESM de
 * 2 KB y el editor nunca monta.
 */
loader.config({
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs",
  },
});

/**
 * Temas alineados con el fondo del sitio, para que el editor no quede como un
 * recuadro pegado encima de la página.
 *
 * Se aplican por la prop `theme` del componente, no con `monaco.editor
 * .setTheme()`: la librería reaplica su prop después del mount y pisaría
 * cualquier llamada manual.
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
 * Editor presentacional: todo el estado y la configuración de lenguaje viven
 * en `use-editor`. Antes este componente leía el store por su cuenta e
 * ignoraba al hook, lo que dejaba el atajo Ctrl+Enter sin efecto.
 *
 * `path` importa: le da al modelo una URI con extensión, y sin eso el worker
 * de TypeScript no transpila ni reporta diagnósticos.
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
      // Autocompletado agresivo: es un playground, no un IDE con ruido.
      quickSuggestions: true,
      suggestOnTriggerCharacters: true,
      tabCompletion: "on",
    }}
  />
);
