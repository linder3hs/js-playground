"use client";

import { Editor } from "@monaco-editor/react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Play, Download, Copy, Maximize, Minimize } from "lucide-react";
import { EditorToolbar } from "@/components/shared/EditorToolbar";
import { JsonTreeView } from "@/components/json/JsonTreeView";
import { useJsonPlayground } from "@/hooks/use-json-playground";

export function JsonPlayground() {
  const {
    jsonInput,
    setJsonInput,
    isFullscreen,
    autoUpdate,
    previewLayout,
    editorFontSize,
    jsonTree,
    expandedPaths,
    jsonError,
    previewRef,
    toggleFullscreen,
    setAutoUpdate,
    setPreviewLayout,
    downloadJson,
    copyJson,
    parseJson,
    toggleNode,
    formatJson,
    editorWillMount,
    handleEditorDidMount,
  } = useJsonPlayground();

  // Toolbar configuration
  const toolbarActions = [
    {
      id: "format",
      label: "Format",
      icon: <Play className="w-4 h-4 mr-2 text-gray-300" />,
      onClick: formatJson,
      tooltip: "Format JSON",
    },
    {
      id: "download",
      label: "Download",
      icon: <Download className="w-4 h-4 mr-2 text-gray-300" />,
      onClick: downloadJson,
      tooltip: "Download as JSON file",
    },
    {
      id: "copy",
      label: "Copy",
      icon: <Copy className="w-4 h-4 mr-2 text-gray-300" />,
      onClick: copyJson,
      tooltip: "Copy formatted JSON to clipboard",
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
      onChange: (value: "right" | "bottom") => setPreviewLayout(value),
      options: [
        { value: "right", label: "Right" },
        { value: "bottom", label: "Bottom" },
      ],
    },
  ];

  return (
    <div
      className={`${
        isFullscreen ? "fixed inset-0 z-50 bg-gray-950" : "h-[calc(100vh-4rem)]"
      }`}
    >
      {/* Toolbar */}
      <EditorToolbar
        title={{ text: "JSON Viewer/Formatter" }}
        actions={toolbarActions}
        toggles={toolbarToggles}
        selects={toolbarSelects}
        darkMode={true}
      />

      {/* Resizable panels */}
      <ResizablePanelGroup
        direction={previewLayout === "bottom" ? "vertical" : "horizontal"}
        className="bg-gray-900"
      >
        <ResizablePanel defaultSize={50}>
          <div className="flex flex-col h-full border border-gray-700 shadow-sm bg-gray-900">
            <div className="flex-1 overflow-hidden">
              <Editor
                height="100%"
                defaultLanguage="json"
                value={jsonInput}
                onChange={(value) => setJsonInput(value || "")}
                beforeMount={editorWillMount}
                onMount={handleEditorDidMount}
                options={{
                  minimap: { enabled: true },
                  fontSize: editorFontSize,
                  lineNumbers: "on",
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  readOnly: false,
                  theme: "json-dark",
                  wordWrap: "on",
                  automaticLayout: true,
                  tabSize: 2,
                  formatOnPaste: true,
                  formatOnType: true,
                }}
              />
            </div>
          </div>
        </ResizablePanel>

        {/* Resizable handle */}
        <ResizableHandle className="bg-gray-700 hover:bg-gray-600" withHandle />

        <ResizablePanel defaultSize={50}>
          <div className="h-full bg-gray-900 flex flex-col overflow-hidden border border-gray-700 shadow-sm">
            <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-200">
                JSON Tree View
              </h3>
              {jsonError && (
                <div className="text-red-400 text-xs">Error: {jsonError}</div>
              )}
            </div>

            <div className="w-full h-full bg-gray-900 relative">
              <JsonTreeView
                jsonTree={jsonTree}
                expandedPaths={expandedPaths}
                toggleNode={toggleNode}
                jsonError={jsonError}
                containerRef={previewRef}
                autoUpdate={autoUpdate}
                onUpdate={parseJson}
              />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
