"use client";

import { Editor } from "@monaco-editor/react";
import {
  Columns2,
  Copy,
  Download,
  Maximize,
  Minimize,
  Play,
  RefreshCw,
  Rows2,
} from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Switch } from "@/components/ui/switch";
import {
  PlaygroundHeader,
  iconButton,
  textButton,
} from "@/components/editor/playground-header";
import { THEMES, defineThemes } from "@/components/editor/monaco-editor";
import { useMarkdownPlayground } from "@/hooks/use-markdown-playground";

/**
 * Misma anatomía que el playground JS/TS: barra de 44px arriba, editor y panel
 * hermano en un `ResizablePanelGroup`, paleta zinc y acento naranja sólo en
 * hover. Aquí el panel hermano es la vista previa en vez de la consola.
 */
export function MarkdownPlayground() {
  const {
    markdown,
    setMarkdown,
    isFullscreen,
    autoUpdate,
    orientation,
    editorFontSize,
    previewRef,
    editorTheme,
    toggleFullscreen,
    setAutoUpdate,
    setOrientation,
    downloadMarkdown,
    copyMarkdown,
    updatePreview,
  } = useMarkdownPlayground();

  return (
    <div
      className={`flex flex-col bg-white text-zinc-900 dark:bg-[#0A0A0B] dark:text-zinc-100 ${
        isFullscreen ? "fixed inset-0 z-50 h-screen" : "h-screen"
      }`}
    >
      <PlaygroundHeader
        left={
          <span className="rounded-md border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-500 dark:border-zinc-800">
            Markdown
          </span>
        }
      >
        <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <Switch
            checked={autoUpdate}
            onCheckedChange={setAutoUpdate}
            aria-label="Preview as you type"
          />
          Preview as you type
        </label>

        <button
          type="button"
          onClick={updatePreview}
          title="Update the preview now"
          className={textButton}
        >
          <Play className="h-3 w-3" aria-hidden />
          Update
        </button>

        <div className="flex items-center">
          <button
            type="button"
            onClick={copyMarkdown}
            title="Copy the Markdown"
            className={iconButton}
          >
            <Copy className="h-4 w-4" aria-hidden />
            <span className="sr-only">Copy the Markdown</span>
          </button>

          <button
            type="button"
            onClick={downloadMarkdown}
            title="Download as a .md file"
            className={iconButton}
          >
            <Download className="h-4 w-4" aria-hidden />
            <span className="sr-only">Download as a .md file</span>
          </button>

          <button
            type="button"
            onClick={() =>
              setOrientation(
                orientation === "horizontal" ? "vertical" : "horizontal"
              )
            }
            title={
              orientation === "horizontal"
                ? "Stack editor and preview"
                : "Place preview beside the editor"
            }
            className={iconButton}
          >
            {orientation === "horizontal" ? (
              <Rows2 className="h-4 w-4" aria-hidden />
            ) : (
              <Columns2 className="h-4 w-4" aria-hidden />
            )}
            <span className="sr-only">Switch layout</span>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            className={iconButton}
          >
            {isFullscreen ? (
              <Minimize className="h-4 w-4" aria-hidden />
            ) : (
              <Maximize className="h-4 w-4" aria-hidden />
            )}
            <span className="sr-only">Toggle fullscreen</span>
          </button>
        </div>
      </PlaygroundHeader>

      <ResizablePanelGroup direction={orientation} className="flex-1">
        <ResizablePanel defaultSize={50} minSize={25}>
          <Editor
            height="100%"
            language="markdown"
            theme={THEMES[editorTheme].name}
            beforeMount={defineThemes}
            value={markdown}
            onChange={(value) => setMarkdown(value || "")}
            options={{
              automaticLayout: true,
              minimap: { enabled: false },
              fontSize: editorFontSize,
              lineNumbers: "on",
              wordWrap: "on",
              tabSize: 2,
              scrollBeyondLastLine: false,
            }}
          />
        </ResizablePanel>

        <ResizableHandle className="bg-zinc-200 transition-colors hover:bg-orange-500/60 dark:bg-zinc-800" />

        <ResizablePanel defaultSize={50} minSize={15}>
          <div className="flex h-full flex-col bg-white dark:bg-[#0A0A0B]">
            <div className="flex h-9 shrink-0 items-center justify-between border-b border-zinc-200 px-3 dark:border-zinc-800">
              <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                Preview
              </span>
              {!autoUpdate && (
                <button
                  type="button"
                  onClick={updatePreview}
                  title="Refresh the preview"
                  className={iconButton}
                >
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                  <span className="sr-only">Refresh the preview</span>
                </button>
              )}
            </div>

            <div
              ref={previewRef}
              className="markdown-preview flex-1 overflow-auto px-5 py-4"
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* La vista previa es HTML inyectado, no JSX: sus estilos no pueden ser
          clases de Tailwind. Los colores salen de la misma paleta zinc que el
          resto del playground, con un juego por tema. */}
      <style jsx global>{`
        .markdown-preview {
          --md-text: #27272a;
          --md-heading: #18181b;
          --md-muted: #71717a;
          --md-border: #e4e4e7;
          --md-surface: #f4f4f5;
          --md-link: #ea580c;
          color: var(--md-text);
          font-size: 0.9375rem;
          line-height: 1.7;
        }

        .dark .markdown-preview {
          --md-text: #d4d4d8;
          --md-heading: #fafafa;
          --md-muted: #a1a1aa;
          --md-border: #27272a;
          --md-surface: #18181b;
          --md-link: #fb923c;
        }

        .markdown-preview > :first-child {
          margin-top: 0;
        }

        .markdown-preview p,
        .markdown-preview ul,
        .markdown-preview ol {
          margin: 0.85rem 0;
        }

        .markdown-preview h1,
        .markdown-preview h2,
        .markdown-preview h3,
        .markdown-preview h4,
        .markdown-preview h5,
        .markdown-preview h6 {
          color: var(--md-heading);
          font-weight: 600;
          line-height: 1.3;
          margin: 1.75rem 0 0.75rem;
        }

        .markdown-preview h1 {
          font-size: 1.5rem;
          border-bottom: 1px solid var(--md-border);
          padding-bottom: 0.4rem;
        }

        .markdown-preview h2 {
          font-size: 1.25rem;
          border-bottom: 1px solid var(--md-border);
          padding-bottom: 0.3rem;
        }

        .markdown-preview h3 {
          font-size: 1.0625rem;
        }

        .markdown-preview a {
          color: var(--md-link);
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: border-color 0.15s ease;
        }

        .markdown-preview a:hover {
          border-bottom-color: currentColor;
        }

        .markdown-preview code {
          font-family: var(--font-geist-mono), ui-monospace, SFMono-Regular,
            Menlo, monospace;
          font-size: 0.8125rem;
          background: var(--md-surface);
          border-radius: 0.25rem;
          padding: 0.15em 0.35em;
        }

        .markdown-preview pre {
          background: var(--md-surface);
          border: 1px solid var(--md-border);
          border-radius: 0.375rem;
          padding: 0.85rem 1rem;
          overflow-x: auto;
          margin: 1.1rem 0;
        }

        .markdown-preview pre code {
          background: none;
          padding: 0;
        }

        .markdown-preview blockquote {
          border-left: 2px solid var(--md-link);
          color: var(--md-muted);
          padding-left: 0.9rem;
          margin: 1.1rem 0;
        }

        .markdown-preview ul,
        .markdown-preview ol {
          padding-left: 1.35rem;
        }

        .markdown-preview ul li {
          list-style: disc;
        }

        .markdown-preview ol li {
          list-style: decimal;
        }

        .markdown-preview li {
          margin: 0.3rem 0;
        }

        .markdown-preview hr {
          border: 0;
          border-top: 1px solid var(--md-border);
          margin: 1.75rem 0;
        }

        .markdown-preview img {
          max-width: 100%;
          border-radius: 0.375rem;
          margin: 1.1rem 0;
        }

        .markdown-preview table {
          border-collapse: collapse;
          width: 100%;
          margin: 1.1rem 0;
          font-size: 0.875rem;
        }

        /* marked marca la alineación de GFM con el atributo align, y un
           text-align plano lo pisaba. */
        .markdown-preview th,
        .markdown-preview td {
          border: 1px solid var(--md-border);
          padding: 0.5rem 0.75rem;
        }

        .markdown-preview th:not([align]),
        .markdown-preview td:not([align]) {
          text-align: left;
        }

        .markdown-preview th {
          background: var(--md-surface);
          color: var(--md-heading);
          font-weight: 600;
        }

        /* Task lists de GFM: marked emite el checkbox dentro del <li>. */
        .markdown-preview li:has(> input[type="checkbox"]) {
          list-style: none;
          margin-left: -1.15rem;
        }

        .markdown-preview input[type="checkbox"] {
          accent-color: var(--md-link);
          margin-right: 0.4rem;
          vertical-align: middle;
        }

        .markdown-preview del {
          color: var(--md-muted);
        }

        /* Prism, con la misma paleta que el editor. */
        .markdown-preview .token.comment,
        .markdown-preview .token.punctuation {
          color: var(--md-muted);
        }

        .markdown-preview .token.keyword,
        .markdown-preview .token.boolean,
        .markdown-preview .token.tag {
          color: #c084fc;
        }

        .markdown-preview .token.string,
        .markdown-preview .token.attr-value {
          color: #4ade80;
        }

        .markdown-preview .token.number,
        .markdown-preview .token.constant {
          color: #fbbf24;
        }

        .markdown-preview .token.function,
        .markdown-preview .token.class-name {
          color: #60a5fa;
        }

        .markdown-preview .token.operator {
          color: var(--md-text);
        }
      `}</style>
    </div>
  );
}
