"use client";

import { useState, useRef, useEffect } from "react";
import { Editor } from "@monaco-editor/react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Play,
  Download,
  Copy,
  Maximize,
  Minimize,
  ChevronDown,
  ChevronRight,
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
import { useToast } from "@/hooks/use-toast";
import { Monaco } from "@monaco-editor/react";
import { MonacoEditor } from "@/web-playground/types";

// Extend Window interface to include Monaco
declare global {
  interface Window {
    monaco?: Monaco;
  }
}

interface JSONNode {
  key: string;
  value: any;
  type: string;
  depth: number;
  expanded: boolean;
  path: string;
  children?: JSONNode[];
}

export function JsonPlayground() {
  const { toast } = useToast();
  const [jsonInput, setJsonInput] = useState<string>(`{
  "name": "JSON Playground",
  "version": "1.0.0",
  "description": "A tool to format and visualize JSON data",
  "features": ["Format", "Validate", "Visualize", "Copy", "Download"],
  "settings": {
    "theme": "dark",
    "autoFormat": true,
    "indentation": 2
  },
  "examples": [
    {
      "id": 1,
      "title": "Simple Object"
    },
    {
      "id": 2,
      "title": "Nested Array"
    }
  ],
  "author": {
    "name": "JS Playground",
    "url": "https://js-playground-alpha.vercel.app"
  }
}`);

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [autoUpdate, setAutoUpdate] = useState<boolean>(true);
  const [previewLayout, setPreviewLayout] = useState<"right" | "bottom">(
    "right"
  );
  const [editorFontSize] = useState<number>(14);
  const [jsonTree, setJsonTree] = useState<JSONNode[]>([]);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [jsonError, setJsonError] = useState<string | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);

  // Function to toggle fullscreen mode
  const toggleFullscreen = (): void => {
    setIsFullscreen(!isFullscreen);
  };

  // Function to download JSON as file
  const downloadJson = (): void => {
    try {
      // Make sure JSON is valid before downloading
      const obj = JSON.parse(jsonInput);
      const formatted = JSON.stringify(obj, null, 2);
      const blob = new Blob([formatted], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "data.json";
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Downloaded",
        description: "JSON file has been downloaded successfully.",
      });
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Error",
          description: `Invalid JSON: ${error.message}`,
          variant: "destructive",
        });
      }
    }
  };

  // Function to copy JSON to clipboard
  const copyJson = (): void => {
    try {
      // Format JSON before copying
      const obj = JSON.parse(jsonInput);
      const formatted = JSON.stringify(obj, null, 2);
      navigator.clipboard.writeText(formatted);

      toast({
        title: "Copied",
        description: "Formatted JSON has been copied to clipboard.",
      });
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Error",
          description: `Invalid JSON: ${error.message}`,
          variant: "destructive",
        });
      }
    }
  };

  // Function to parse JSON and generate tree structure
  const parseJson = (): void => {
    try {
      const obj = JSON.parse(jsonInput);
      setJsonError(null);
      const tree = buildJsonTree(obj, "", 0);
      setJsonTree(tree);

      // Expand first level by default
      const newExpandedPaths = new Set<string>();
      tree.forEach((node) => {
        newExpandedPaths.add(node.path);
      });
      setExpandedPaths(newExpandedPaths);
    } catch (error) {
      if (error instanceof Error) {
        setJsonError(error.message);
        setJsonTree([]);
      }
    }
  };

  // Build tree structure from JSON object
  const buildJsonTree = (
    obj: any,
    parent: string,
    depth: number
  ): JSONNode[] => {
    if (!obj || typeof obj !== "object") return [];

    return Object.keys(obj).map((key) => {
      const value = obj[key];
      const path = parent ? `${parent}.${key}` : key;
      const type = Array.isArray(value) ? "array" : typeof value;
      const isObject = value !== null && typeof value === "object";

      const node: JSONNode = {
        key,
        value: isObject ? null : value,
        type,
        depth,
        expanded: false,
        path,
      };

      if (isObject) {
        node.children = buildJsonTree(value, path, depth + 1);
      }

      return node;
    });
  };

  // Toggle expanded state of a tree node
  const toggleNode = (path: string): void => {
    const newExpandedPaths = new Set(expandedPaths);
    if (newExpandedPaths.has(path)) {
      newExpandedPaths.delete(path);
    } else {
      newExpandedPaths.add(path);
    }
    setExpandedPaths(newExpandedPaths);
  };

  // Format JSON in editor
  const formatJson = (): void => {
    try {
      const obj = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(obj, null, 2));
      setJsonError(null);
      parseJson();
    } catch (error) {
      if (error instanceof Error) {
        setJsonError(error.message);
      }
    }
  };

  // Configure Monaco editor
  const editorWillMount = (monaco: Monaco) => {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: false,
      schemaValidation: "warning",
      schemas: [],
    });

    // Define a custom dark theme
    monaco.editor.defineTheme("json-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "string", foreground: "CE9178" },
        { token: "number", foreground: "B5CEA8" },
        { token: "keyword", foreground: "569CD6" },
      ],
      colors: {
        "editor.background": "#1E1E1E",
        "editor.foreground": "#D4D4D4",
        "editorLineNumber.foreground": "#858585",
        "editor.lineHighlightBackground": "#2D2D30",
        "editor.selectionBackground": "#264F78",
        "editor.inactiveSelectionBackground": "#3A3D41",
      },
    });

    // Set as default theme
    monaco.editor.setTheme("json-dark");
  };

  // Handle editor mounting
  const handleEditorDidMount = (editor: MonacoEditor, monaco: Monaco) => {
    monaco.editor.setTheme("json-dark");

    // Add custom action for formatting
    editor.addAction({
      id: "format-json",
      label: "Format JSON",
      keybindings: [
        monaco.KeyMod.Alt | monaco.KeyMod.Shift | monaco.KeyCode.KeyF,
      ],
      run: () => formatJson(),
    });

    // Force redraw to apply theme correctly
    setTimeout(() => {
      editor.updateOptions({});
    }, 100);
  };

  // Auto-update JSON tree when input changes
  useEffect(() => {
    if (autoUpdate) {
      parseJson();
    }
  }, [jsonInput, autoUpdate]);

  // Render a JSON node
  const renderJsonNode = (node: JSONNode): JSX.Element => {
    const isExpanded = expandedPaths.has(node.path);
    const hasChildren = node.children && node.children.length > 0;
    const indent = `${node.depth * 16}px`;

    // Determine the value style based on type
    let valueStyle = "text-gray-300";
    let valueDisplay: React.ReactNode = String(node.value);

    switch (typeof node.value) {
      case "string":
        valueStyle = "text-green-400";
        valueDisplay = `"${node.value}"`;
        break;
      case "number":
        valueStyle = "text-blue-400";
        break;
      case "boolean":
        valueStyle = "text-yellow-400";
        break;
      case "object":
        if (node.value === null) {
          valueStyle = "text-red-400";
          valueDisplay = "null";
        }
        break;
    }

    return (
      <div key={node.path}>
        <div
          className="flex items-center py-1 hover:bg-gray-800 rounded cursor-pointer"
          onClick={() => hasChildren && toggleNode(node.path)}
          style={{ paddingLeft: indent }}
        >
          {hasChildren ? (
            <div className="mr-1 text-gray-400">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          ) : (
            <div className="w-4 mr-1"></div>
          )}

          <div className="flex items-center">
            <span className="text-purple-400 font-medium">
              {JSON.stringify(node.key)}:{" "}
            </span>
            {!hasChildren && <span className={valueStyle}>{valueDisplay}</span>}
            {hasChildren && (
              <span className="text-gray-400 ml-1">
                {node.type === "array" ? "Array" : "Object"}
                <span className="text-gray-500 text-xs ml-1">
                  ({node.children?.length}{" "}
                  {node.children && node.children.length === 1
                    ? "item"
                    : "items"}
                  )
                </span>
              </span>
            )}
          </div>
        </div>

        {isExpanded &&
          hasChildren &&
          node.children?.map((child) => renderJsonNode(child))}
      </div>
    );
  };

  return (
    <div
      className={`${
        isFullscreen ? "fixed inset-0 z-50 bg-gray-950" : "h-[calc(100vh-4rem)]"
      }`}
    >
      <div className="flex items-center justify-between bg-gray-950 px-4 py-2 border-b border-gray-700 shadow-sm">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-100">
            JSON Viewer/Formatter
          </h2>
          <div className="flex items-center gap-1">
            <Label htmlFor="auto-update" className="text-sm mr-1 text-gray-300">
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
              onValueChange={(value: "right" | "bottom") =>
                setPreviewLayout(value)
              }
            >
              <SelectTrigger className="h-8 w-24 border-gray-900 bg-gray-950 text-gray-100">
                <SelectValue placeholder="Layout" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-gray-100">
                <SelectItem
                  value="right"
                  className="focus:bg-gray-700 focus:text-gray-100"
                >
                  Right
                </SelectItem>
                <SelectItem
                  value="bottom"
                  className="focus:bg-gray-700 focus:text-gray-100"
                >
                  Bottom
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={formatJson}
                  className="border-gray-700 bg-gray-800 text-gray-100 hover:bg-gray-700"
                >
                  <Play className="w-4 h-4 mr-2 text-gray-300" />
                  Format
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Format JSON</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadJson}
                  className="border-gray-700 bg-gray-800 text-gray-100 hover:bg-gray-700"
                >
                  <Download className="w-4 h-4 mr-2 text-gray-300" />
                  Download
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download as JSON file</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyJson}
                  className="border-gray-700 bg-gray-800 text-gray-100 hover:bg-gray-700"
                >
                  <Copy className="w-4 h-4 mr-2 text-gray-300" />
                  Copy
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy formatted JSON to clipboard</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="border-gray-700 bg-gray-800 text-gray-100 hover:bg-gray-700"
                >
                  {isFullscreen ? (
                    <Minimize className="w-4 h-4 text-gray-300" />
                  ) : (
                    <Maximize className="w-4 h-4 text-gray-300" />
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
              {!autoUpdate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={parseJson}
                  title="Update Tree View"
                  className="text-gray-300 hover:bg-gray-700"
                >
                  <Play className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div
              ref={previewRef}
              className="w-full h-full bg-gray-900 overflow-auto p-4 font-mono text-sm"
            >
              {jsonError ? (
                <div className="text-red-400 p-4 bg-red-900/20 rounded">
                  <strong>JSON Error:</strong> {jsonError}
                </div>
              ) : jsonTree.length > 0 ? (
                <div>{jsonTree.map((node) => renderJsonNode(node))}</div>
              ) : (
                <div className="text-gray-400 flex items-center justify-center h-full">
                  Enter valid JSON in the editor to see the tree view
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
