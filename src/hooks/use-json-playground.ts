import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Monaco } from "@monaco-editor/react";
import { MonacoEditor } from "@/web-playground/types";
import {
  JSONNode,
  buildJSONTree,
  formatJSON,
  validateJSON,
} from "@/lib/utils/json-formatter";

// Default JSON example to show on first load
const DEFAULT_JSON = `{
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
}`;

export interface UseJsonPlaygroundOptions {
  initialJson?: string;
}

export function useJsonPlayground(options?: UseJsonPlaygroundOptions) {
  const { toast } = useToast();
  const [jsonInput, setJsonInput] = useState<string>(
    options?.initialJson || DEFAULT_JSON
  );

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

  // Toggle fullscreen mode
  const toggleFullscreen = (): void => {
    setIsFullscreen(!isFullscreen);
  };

  // Download JSON as file
  const downloadJson = (): void => {
    const result = formatJSON(jsonInput);

    if (result.error) {
      toast({
        title: "Error",
        description: `Invalid JSON: ${result.error}`,
        variant: "destructive",
      });
      return;
    }

    const blob = new Blob([result.formatted!], { type: "application/json" });
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
  };

  // Copy JSON to clipboard
  const copyJson = (): void => {
    const result = formatJSON(jsonInput);

    if (result.error) {
      toast({
        title: "Error",
        description: `Invalid JSON: ${result.error}`,
        variant: "destructive",
      });
      return;
    }

    navigator.clipboard.writeText(result.formatted!);

    toast({
      title: "Copied",
      description: "Formatted JSON has been copied to clipboard.",
    });
  };

  // Parse JSON and generate tree
  const parseJson = (): void => {
    const validation = validateJSON(jsonInput);

    if (!validation.valid) {
      setJsonError(validation.error);
      setJsonTree([]);
      return;
    }

    setJsonError(null);
    const obj = JSON.parse(jsonInput);
    const tree = buildJSONTree(obj);
    setJsonTree(tree);

    // Expand first level by default
    const newExpandedPaths = new Set<string>();
    tree.forEach((node) => {
      newExpandedPaths.add(node.path);
    });
    setExpandedPaths(newExpandedPaths);
  };

  // Toggle a tree node expanded/collapsed
  const toggleNode = (path: string): void => {
    const newExpandedPaths = new Set(expandedPaths);
    if (newExpandedPaths.has(path)) {
      newExpandedPaths.delete(path);
    } else {
      newExpandedPaths.add(path);
    }
    setExpandedPaths(newExpandedPaths);
  };

  // Format the JSON in the editor
  const formatJson = (): void => {
    const result = formatJSON(jsonInput);

    if (result.error) {
      setJsonError(result.error);
      return;
    }

    setJsonInput(result.formatted!);
    setJsonError(null);
    parseJson();
  };

  // Configure Monaco editor
  const editorWillMount = (monaco: Monaco) => {
    // JSON language configuration
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: false,
      schemaValidation: "warning",
      schemas: [],
    });

    // Custom dark theme
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

    monaco.editor.setTheme("json-dark");
  };

  // Handle editor mounting
  const handleEditorDidMount = (editor: MonacoEditor, monaco: Monaco) => {
    monaco.editor.setTheme("json-dark");

    // Add format action
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

  // Update JSON tree when input changes (if auto-update is enabled)
  useEffect(() => {
    if (autoUpdate) {
      parseJson();
    }
  }, [jsonInput, autoUpdate]);

  // Return everything needed by the component
  return {
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
  };
}
