"use client";

import { Editor } from "@monaco-editor/react";
import {
  AlertCircle,
  Columns2,
  Copy,
  Download,
  Maximize,
  Minimize,
  RefreshCw,
  Rows2,
  Wand2,
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
import { JsonTreeView } from "@/components/json/JsonTreeView";
import { useJsonPlayground } from "@/hooks/use-json-playground";

/**
 * Same anatomy as JS/TS and Markdown: a 44px bar, editor and sibling panel in
 * a `ResizablePanelGroup`, zinc palette and orange only on hover. Here the
 * sibling panel is the JSON tree.
 */
export function JsonPlayground() {
  const {
    jsonInput,
    setJsonInput,
    isFullscreen,
    autoUpdate,
    orientation,
    editorFontSize,
    editorTheme,
    jsonTree,
    expandedPaths,
    jsonError,
    previewRef,
    toggleFullscreen,
    setAutoUpdate,
    setOrientation,
    downloadJson,
    copyJson,
    parseJson,
    toggleNode,
    formatJson,
    editorWillMount,
    handleEditorDidMount,
  } = useJsonPlayground();

  return (
    <div
      className={`flex flex-col bg-white text-zinc-900 dark:bg-[#0A0A0B] dark:text-zinc-100 ${
        isFullscreen ? "fixed inset-0 z-50 h-screen" : "h-screen"
      }`}
    >
      <PlaygroundHeader>
        <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <Switch
            checked={autoUpdate}
            onCheckedChange={setAutoUpdate}
            aria-label="Parse as you type"
          />
          <span className="hidden sm:inline">Parse as you type</span>
        </label>

        <button
          type="button"
          onClick={formatJson}
          title="Format the JSON (Alt + Shift + F)"
          className={textButton}
        >
          <Wand2 className="h-3 w-3" aria-hidden />
          Format
        </button>

        <div className="flex items-center">
          <button
            type="button"
            onClick={copyJson}
            title="Copy the formatted JSON"
            className={iconButton}
          >
            <Copy className="h-4 w-4" aria-hidden />
            <span className="sr-only">Copy the formatted JSON</span>
          </button>

          <button
            type="button"
            onClick={downloadJson}
            title="Download as a .json file"
            className={iconButton}
          >
            <Download className="h-4 w-4" aria-hidden />
            <span className="sr-only">Download as a .json file</span>
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
                ? "Stack editor and tree"
                : "Place the tree beside the editor"
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
            language="json"
            theme={THEMES[editorTheme].name}
            beforeMount={(monaco) => {
              defineThemes(monaco);
              editorWillMount(monaco);
            }}
            value={jsonInput}
            onChange={(value) => setJsonInput(value || "")}
            onMount={handleEditorDidMount}
            options={{
              automaticLayout: true,
              minimap: { enabled: false },
              fontSize: editorFontSize,
              lineNumbers: "on",
              wordWrap: "on",
              tabSize: 2,
              scrollBeyondLastLine: false,
              formatOnPaste: true,
              formatOnType: true,
            }}
          />
        </ResizablePanel>

        <ResizableHandle className="bg-zinc-200 transition-colors hover:bg-orange-500/60 dark:bg-zinc-800" />

        <ResizablePanel defaultSize={50} minSize={15}>
          <div className="flex h-full flex-col bg-white dark:bg-[#0A0A0B]">
            <div className="flex h-9 shrink-0 items-center justify-between gap-2 border-b border-zinc-200 px-3 dark:border-zinc-800">
              <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                Tree
              </span>
              {!autoUpdate && !jsonError && (
                <button
                  type="button"
                  onClick={parseJson}
                  title="Rebuild the tree"
                  className={iconButton}
                >
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                  <span className="sr-only">Rebuild the tree</span>
                </button>
              )}
              {jsonError && (
                <span className="inline-flex min-w-0 items-center gap-1 text-[11px] text-red-600 dark:text-red-400">
                  <AlertCircle className="h-3 w-3 shrink-0" aria-hidden />
                  <span className="truncate">{jsonError}</span>
                </span>
              )}
            </div>

            <JsonTreeView
              jsonTree={jsonTree}
              expandedPaths={expandedPaths}
              toggleNode={toggleNode}
              jsonError={jsonError}
              containerRef={previewRef}
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
