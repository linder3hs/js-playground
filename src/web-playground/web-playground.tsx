"use client";

import { Editor } from "@monaco-editor/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Code2,
  Code,
  Eclipse,
  Play,
  Download,
  Copy,
  Maximize,
  Minimize,
} from "lucide-react";
import { EditorToolbar } from "@/components/shared/EditorToolbar";
import { useWebPlayground } from "@/hooks/use-web-playground";

export function WebPlayground(): JSX.Element {
  const {
    files,
    config,
    autoUpdate,
    previewRef,
    isFullscreen,
    previewLayout,
    editorFontSize,
    updatePreview,
    updateFile,
    setAutoUpdate,
    downloadProject,
    editorWillMount,
    setPreviewLayout,
    toggleFullscreen,
    copyHtmlToClipboard,
    handleEditorDidMount,
  } = useWebPlayground();

  // Toolbar configuration
  const toolbarActions = [
    {
      id: "run",
      label: "Run",
      icon: <Play className="w-4 h-4 mr-2" />,
      onClick: updatePreview,
      tooltip: "Run your code",
    },
    {
      id: "download",
      label: "Download",
      icon: <Download className="w-4 h-4 mr-2" />,
      onClick: downloadProject,
      tooltip: "Download as HTML file",
    },
    {
      id: "copy",
      label: "Copy",
      icon: <Copy className="w-4 h-4 mr-2" />,
      onClick: copyHtmlToClipboard,
      tooltip: "Copy HTML to clipboard",
    },
    {
      id: "fullscreen",
      label: "",
      icon: isFullscreen ? (
        <Minimize className="w-4 h-4" />
      ) : (
        <Maximize className="w-4 h-4" />
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
      onChange: (value: "split" | "bottom" | "right") =>
        setPreviewLayout(value),
      options: [
        { value: "split", label: "Split" },
        { value: "bottom", label: "Bottom" },
        { value: "right", label: "Right" },
      ],
    },
  ];

  return (
    <div
      className={`${
        isFullscreen
          ? "fixed inset-0 z-50 bg-background"
          : "h-[calc(100vh-4rem)]"
      }`}
    >
      {/* Toolbar */}
      <EditorToolbar
        title={{ text: "Web Playground" }}
        actions={toolbarActions}
        toggles={toolbarToggles}
        selects={toolbarSelects}
        darkMode={true}
      />

      <ResizablePanelGroup direction={config.direction}>
        <ResizablePanel defaultSize={config.editorSize}>
          <Tabs defaultValue="html" className="h-full flex flex-col">
            <TabsList className="w-full justify-start gap-2 px-4 py-2 bg-background">
              <TabsTrigger value="html" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                HTML
              </TabsTrigger>
              <TabsTrigger value="css" className="flex items-center gap-2">
                <Eclipse className="w-4 h-4" />
                CSS
              </TabsTrigger>
              <TabsTrigger value="js" className="flex items-center gap-2">
                <Code2 className="w-4 h-4" />
                JavaScript
              </TabsTrigger>
            </TabsList>

            {/* Editor HTML */}
            <TabsContent
              value="html"
              className="flex-1 p-0 m-0 border-none overflow-hidden"
            >
              <Editor
                height="100%"
                defaultLanguage="html"
                value={files.html.content}
                onChange={(value: string | undefined) =>
                  updateFile("html", value || "")
                }
                beforeMount={editorWillMount}
                onMount={handleEditorDidMount}
                options={{
                  minimap: { enabled: true },
                  fontSize: editorFontSize,
                  lineNumbers: "on",
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  readOnly: false,
                  theme: "custom-dark",
                  wordWrap: "on",
                  automaticLayout: true,
                  formatOnPaste: true,
                  formatOnType: true,
                  tabSize: 2,
                  snippetSuggestions: "on",
                  suggestOnTriggerCharacters: true,
                  acceptSuggestionOnEnter: "on",
                  quickSuggestions: true,
                  contextmenu: true,
                  suggest: {
                    showKeywords: true,
                    showSnippets: true,
                    showMethods: true,
                    showFunctions: true,
                    showConstructors: true,
                    showFields: true,
                  },
                  acceptSuggestionOnCommitCharacter: true,
                  cursorBlinking: "smooth",
                  cursorSmoothCaretAnimation: "on",
                  cursorStyle: "line",
                  mouseWheelZoom: true,
                  smoothScrolling: true,
                  renderWhitespace: "none",
                  scrollBeyondLastColumn: 5,
                  folding: true,
                  fontFamily: "JetBrains Mono, 'Courier New', monospace",
                  bracketPairColorization: { enabled: true },
                  guides: {
                    bracketPairs: true,
                    indentation: true,
                    highlightActiveIndentation: true,
                  },
                }}
              />
            </TabsContent>

            {/* Editor CSS */}
            <TabsContent value="css" className="flex-1 p-0 m-0 overflow-hidden">
              <Editor
                height="100%"
                defaultLanguage="css"
                value={files.css.content}
                onChange={(value: string | undefined) =>
                  updateFile("css", value || "")
                }
                beforeMount={editorWillMount}
                onMount={handleEditorDidMount}
                options={{
                  minimap: { enabled: true },
                  fontSize: editorFontSize,
                  lineNumbers: "on",
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  readOnly: false,
                  theme: "custom-dark",
                  wordWrap: "on",
                  automaticLayout: true,
                  formatOnPaste: true,
                  formatOnType: true,
                  tabSize: 2,
                  snippetSuggestions: "on",
                }}
              />
            </TabsContent>

            {/* Editor JavaScript */}
            <TabsContent value="js" className="flex-1 p-0 m-0 overflow-hidden">
              <Editor
                height="100%"
                defaultLanguage="javascript"
                value={files.javascript.content}
                onChange={(value: string | undefined) =>
                  updateFile("javascript", value || "")
                }
                beforeMount={editorWillMount}
                onMount={handleEditorDidMount}
                options={{
                  minimap: { enabled: true },
                  fontSize: editorFontSize,
                  lineNumbers: "on",
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  readOnly: false,
                  theme: "custom-dark",
                  wordWrap: "on",
                  automaticLayout: true,
                  formatOnPaste: true,
                  formatOnType: true,
                  tabSize: 2,
                  snippetSuggestions: "on",
                }}
              />
            </TabsContent>
          </Tabs>
        </ResizablePanel>

        {/* Resizable handle */}
        <ResizableHandle withHandle className="bg-gray-700 hover:bg-gray-600" />

        {/* Preview panel */}
        <ResizablePanel defaultSize={config.previewSize}>
          <div className="h-full bg-background flex flex-col overflow-hidden border">
            <div className="bg-background px-4 py-2 border-b flex items-center justify-between">
              <h3 className="text-sm font-medium">Preview</h3>
              {!autoUpdate && (
                <button
                  onClick={updatePreview}
                  className="p-1 rounded-md hover:bg-gray-700"
                  title="Refresh Preview"
                >
                  <Play className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="w-full h-full bg-white relative">
              <iframe
                ref={previewRef}
                className="w-full h-full"
                title="preview"
                sandbox="allow-scripts"
              />
              {!autoUpdate && (
                <div className="absolute inset-0 bg-black/5 flex items-center justify-center pointer-events-none">
                  <button
                    onClick={updatePreview}
                    className="pointer-events-auto px-4 py-2 bg-gray-800 text-gray-100 hover:bg-gray-700 rounded-md flex items-center"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Click to Run
                  </button>
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
