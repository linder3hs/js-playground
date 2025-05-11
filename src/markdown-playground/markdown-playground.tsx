"use client";

import { Editor } from "@monaco-editor/react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Play, Download, Copy, Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditorToolbar } from "@/components/shared/EditorToolbar";
import { useMarkdownPlayground } from "@/hooks/use-markdown-playground";

export function MarkdownPlayground() {
  const {
    markdown,
    setMarkdown,
    isFullscreen,
    autoUpdate,
    previewLayout,
    editorFontSize,
    previewRef,
    toggleFullscreen,
    setAutoUpdate,
    setPreviewLayout,
    downloadMarkdown,
    copyMarkdown,
    updatePreview,
    editorWillMount,
    handleEditorDidMount,
  } = useMarkdownPlayground();

  // Toolbar configuration
  const toolbarActions = [
    {
      id: "update",
      label: "Update",
      icon: <Play className="w-4 h-4 mr-2 text-gray-300" />,
      onClick: updatePreview,
      tooltip: "Update preview",
    },
    {
      id: "download",
      label: "Download",
      icon: <Download className="w-4 h-4 mr-2 text-gray-300" />,
      onClick: downloadMarkdown,
      tooltip: "Download as Markdown file",
    },
    {
      id: "copy",
      label: "Copy",
      icon: <Copy className="w-4 h-4 mr-2 text-gray-300" />,
      onClick: copyMarkdown,
      tooltip: "Copy Markdown to clipboard",
    },
    {
      id: "fullscreen",
      label: "",
      icon: isFullscreen ? (
        <Minimize className="w-4 h-4 text-gray-300" />
      ) : (
        <Maximize className="w-4 h-4 text-gray-300" />
      ),
      onClick: toggleFullscreen,
      tooltip: isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen",
    },
  ];

  const toolbarToggles = [
    {
      id: "auto-update",
      label: "Auto Update",
      isChecked: autoUpdate,
      onChange: setAutoUpdate,
    },
  ];

  const toolbarSelects = [
    {
      id: "layout-select",
      value: previewLayout,
      onChange: (value: "right" | "left") => setPreviewLayout(value),
      options: [
        { value: "right", label: "Right" },
        { value: "left", label: "Left" },
      ],
    },
  ];

  const config = {
    direction: previewLayout === "right" ? "horizontal" : "horizontal",
    editorSize: 50,
    previewSize: 50,
  };

  return (
    <div
      className={`${
        isFullscreen ? "fixed inset-0 z-50 bg-gray-950" : "h-[calc(100vh-4rem)]"
      }`}
    >
      {/* Toolbar */}
      <EditorToolbar
        title={{ text: "Markdown Editor" }}
        actions={toolbarActions}
        toggles={toolbarToggles}
        selects={toolbarSelects}
        darkMode={true}
      />

      {/* Resizable panels */}
      <ResizablePanelGroup
        direction={config.direction as "horizontal" | "vertical"}
        className="bg-gray-900"
      >
        {previewLayout === "left" && (
          <ResizablePanel defaultSize={config.previewSize}>
            <div className="h-full bg-gray-900 flex flex-col overflow-hidden border border-gray-900 shadow-sm">
              <div className="bg-gray-950 px-4 py-2 border-b border-gray-900 flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-200">Preview</h3>
                {!autoUpdate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={updatePreview}
                    title="Refresh Preview"
                    className="text-gray-300 hover:bg-gray-700"
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <div className="w-full h-full bg-gray-900 overflow-auto p-4 relative">
                <div
                  ref={previewRef}
                  className="markdown-preview prose max-w-none dark-mode"
                ></div>
                {!autoUpdate && (
                  <div className="absolute inset-0 bg-gray-900/70 flex items-center justify-center pointer-events-none">
                    <Button
                      onClick={updatePreview}
                      className="pointer-events-auto bg-gray-800 text-gray-100 hover:bg-gray-700"
                      variant="secondary"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Click to Update
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>
        )}

        <ResizablePanel defaultSize={config.editorSize}>
          <div className="flex flex-col h-full border border-gray-700 shadow-sm bg-gray-900">
            <div className="flex-1 overflow-hidden">
              <Editor
                height="100%"
                defaultLanguage="markdown"
                value={markdown}
                onChange={(value) => setMarkdown(value || "")}
                beforeMount={editorWillMount}
                onMount={handleEditorDidMount}
                options={{
                  minimap: { enabled: true },
                  fontSize: editorFontSize,
                  lineNumbers: "on",
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  readOnly: false,
                  theme: "vs-dark-custom",
                  wordWrap: "on",
                  automaticLayout: true,
                  tabSize: 2,
                  snippetSuggestions: "on",
                }}
              />
            </div>
          </div>
        </ResizablePanel>

        {/* Resizable handle */}
        <ResizableHandle className="bg-gray-700 hover:bg-gray-600" withHandle />

        {previewLayout === "right" && (
          <ResizablePanel defaultSize={config.previewSize}>
            <div className="h-full bg-gray-900 flex flex-col overflow-hidden border border-gray-700 shadow-sm">
              <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-200">Preview</h3>
                {!autoUpdate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={updatePreview}
                    title="Refresh Preview"
                    className="text-gray-300 hover:bg-gray-700"
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <div className="w-full h-full bg-gray-900 overflow-auto p-4 relative">
                <div
                  ref={previewRef}
                  className="markdown-preview prose max-w-none dark-mode"
                ></div>
                {!autoUpdate && (
                  <div className="absolute inset-0 bg-gray-900/70 flex items-center justify-center pointer-events-none">
                    <Button
                      onClick={updatePreview}
                      className="pointer-events-auto bg-gray-800 text-gray-100 hover:bg-gray-700"
                      variant="secondary"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Click to Update
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>
        )}
      </ResizablePanelGroup>

      {/* CSS for markdown preview (keeping the same styles for consistency) */}
      <style jsx global>{`
        .markdown-preview {
          color: #e2e8f0;
          line-height: 1.6;
          font-size: 1rem;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
        }

        .markdown-preview p {
          color: #e2e8f0;
          margin: 1rem 0;
          font-size: 1rem;
        }

        .markdown-preview a {
          color: #60a5fa;
          text-decoration: none;
          border-bottom: 1px solid rgba(96, 165, 250, 0.3);
          transition: border-color 0.2s ease;
        }

        .markdown-preview a:hover {
          border-bottom-color: #60a5fa;
        }

        .markdown-preview img {
          max-width: 100%;
          margin: 1.5rem 0;
          border-radius: 0.375rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3),
            0 2px 4px -1px rgba(0, 0, 0, 0.2);
        }

        .markdown-preview pre {
          background-color: #2d3748;
          padding: 1rem;
          border-radius: 0.375rem;
          overflow-x: auto;
          margin: 1.5rem 0;
          border: 1px solid #4a5568;
        }

        .markdown-preview code {
          font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo,
            Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: 0.875rem;
          padding: 0.2em 0.4em;
          background-color: #2d3748;
          border-radius: 0.25rem;
          color: #e2e8f0;
        }

        .markdown-preview pre code {
          padding: 0;
          background-color: transparent;
          border-radius: 0;
          color: #e2e8f0;
        }

        .markdown-preview table {
          border-collapse: collapse;
          width: 100%;
          margin: 1.5rem 0;
          border: 1px solid #4a5568;
          border-radius: 0.375rem;
          overflow: hidden;
        }

        .markdown-preview table th {
          background-color: #2d3748;
          color: #f7fafc;
          font-weight: 600;
          padding: 0.75rem 1rem;
          text-align: left;
          border-bottom: 1px solid #4a5568;
        }

        .markdown-preview table td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #4a5568;
          color: #e2e8f0;
        }

        .markdown-preview table tr:last-child td {
          border-bottom: none;
        }

        .markdown-preview table tr:nth-child(even) {
          background-color: #2d3748;
        }

        .markdown-preview table tr:hover {
          background-color: #4a5568;
        }

        .markdown-preview blockquote {
          border-left: 4px solid #4a5568;
          padding: 0.5rem 0 0.5rem 1rem;
          margin: 1.5rem 0;
          color: #cbd5e0;
          background-color: #2d3748;
          border-radius: 0 0.25rem 0.25rem 0;
        }

        .markdown-preview blockquote strong {
          color: #f7fafc;
        }

        .markdown-preview ul,
        .markdown-preview ol {
          padding-left: 1.5rem;
          margin: 1rem 0;
          color: #e2e8f0;
        }

        .markdown-preview li {
          margin: 0.5rem 0;
        }

        .markdown-preview ul li {
          list-style-type: disc;
        }

        .markdown-preview ol li {
          list-style-type: decimal;
        }

        .markdown-preview hr {
          border: 0;
          border-top: 1px solid #4a5568;
          margin: 2rem 0;
        }

        .markdown-preview h1,
        .markdown-preview h2,
        .markdown-preview h3,
        .markdown-preview h4,
        .markdown-preview h5,
        .markdown-preview h6 {
          color: #f7fafc;
          font-weight: 600;
          line-height: 1.25;
          margin-top: 2rem;
          margin-bottom: 1rem;
          position: relative;
        }

        .markdown-preview h1 {
          font-size: 2rem;
          border-bottom: 1px solid #4a5568;
          padding-bottom: 0.5rem;
          margin-top: 0;
        }

        .markdown-preview h2 {
          font-size: 1.5rem;
          border-bottom: 1px solid #4a5568;
          padding-bottom: 0.25rem;
        }

        .markdown-preview h3 {
          font-size: 1.25rem;
        }

        .markdown-preview h4 {
          font-size: 1.125rem;
        }

        .markdown-preview .math {
          font-family: serif;
          color: #e2e8f0;
        }

        /* Syntax highlighting for code blocks - Dark theme */
        .markdown-preview code .token.comment {
          color: #a0aec0;
        }

        .markdown-preview code .token.keyword {
          color: #63b3ed;
        }

        .markdown-preview code .token.string {
          color: #f6ad55;
        }

        .markdown-preview code .token.number {
          color: #4fd1c5;
        }

        .markdown-preview code .token.function {
          color: #b794f4;
        }

        .markdown-preview code .token.operator {
          color: #cbd5e0;
        }

        .markdown-preview code .token.punctuation {
          color: #a0aec0;
        }

        /* Custom scrollbar for dark theme */
        .markdown-preview::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }

        .markdown-preview::-webkit-scrollbar-track {
          background: #2d3748;
        }

        .markdown-preview::-webkit-scrollbar-thumb {
          background: #4a5568;
          border-radius: 5px;
        }

        .markdown-preview::-webkit-scrollbar-thumb:hover {
          background: #718096;
        }
      `}</style>
    </div>
  );
}
