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
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWebPlayground } from "./hooks/useWebPlayground";

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

  return (
    <div
      className={`${
        isFullscreen
          ? "fixed inset-0 z-50 bg-background"
          : "h-[calc(100vh-4rem)]"
      }`}
    >
      <div className="flex items-center justify-between bg-background px-4 py-2 border-b">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Web Playground</h2>
          <div className="flex items-center gap-1">
            <Label htmlFor="auto-update" className="text-sm mr-1">
              Auto Update
            </Label>
            <Switch
              id="auto-update"
              checked={autoUpdate}
              onCheckedChange={setAutoUpdate}
            />
          </div>
          <div className="flex items-center gap-5">
            <Select
              value={previewLayout}
              onValueChange={(value: "split" | "bottom" | "right") =>
                setPreviewLayout(value)
              }
            >
              <SelectTrigger className="h-8 w-24">
                <SelectValue placeholder="Layout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="split">Split</SelectItem>
                <SelectItem value="bottom">Bottom</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={updatePreview}>
                  <Play className="w-4 h-4 mr-2" />
                  Run
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Run your code</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={downloadProject}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download as HTML file</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyHtmlToClipboard}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy HTML to clipboard</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                  {isFullscreen ? (
                    <Minimize className="w-4 h-4" />
                  ) : (
                    <Maximize className="w-4 h-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

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

        {/* Separador redimensionable */}
        <ResizableHandle withHandle />

        {/* Panel de vista previa */}
        <ResizablePanel defaultSize={config.previewSize}>
          <div className="h-full bg-background flex flex-col overflow-hidden border">
            <div className="bg-background px-4 py-2 border-b flex items-center justify-between">
              <h3 className="text-sm font-medium">Preview</h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={updatePreview}
                  title="Refresh Preview"
                >
                  <Play className="w-4 h-4" />
                </Button>
              </div>
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
                  <Button
                    onClick={updatePreview}
                    className="pointer-events-auto"
                    variant="secondary"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Click to Run
                  </Button>
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
