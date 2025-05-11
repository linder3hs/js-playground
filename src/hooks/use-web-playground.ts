import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Monaco } from "@monaco-editor/react";
import { MonacoEditor } from "@/web-playground/types";
import { useWebPlaygroundStore } from "@/store/web-playground-store";
import { LayoutConfig } from "@/web-playground/types";

export function useWebPlayground() {
  const { files, updateFile } = useWebPlaygroundStore();
  const { toast } = useToast();

  // References and states
  const previewRef = useRef<HTMLIFrameElement>(null);
  const [autoUpdate, setAutoUpdate] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [editorFontSize] = useState<number>(14);
  const [previewLayout, setPreviewLayout] = useState<
    "split" | "bottom" | "right"
  >("right");

  // Hook for Monaco instance
  const monaco = useRef<Monaco | null>(null);

  // Configure Monaco editor
  const editorWillMount = (monacoInstance: Monaco) => {
    monaco.current = monacoInstance;

    // Define a custom dark theme
    monacoInstance.editor.defineTheme("custom-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#1E1E1E",
        "editor.foreground": "#D4D4D4",
        "editorCursor.foreground": "#AEAFAD",
        "editor.lineHighlightBackground": "#2D2D30",
        "editorLineNumber.foreground": "#858585",
        "editor.selectionBackground": "#264F78",
        "editor.inactiveSelectionBackground": "#3A3D41",
      },
    });

    monacoInstance.editor.setTheme("custom-dark");

    // Configure languages
    monacoInstance.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monacoInstance.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution:
        monacoInstance.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monacoInstance.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      typeRoots: ["node_modules/@types"],
      jsx: monacoInstance.languages.typescript.JsxEmit.React,
      jsxFactory: "React.createElement",
      lib: ["dom", "es2018"],
    });

    // Add type definitions for DOM APIs
    monacoInstance.languages.typescript.javascriptDefaults.addExtraLib(
      `
      interface Document {
        querySelector(selectors: string): Element | null;
        querySelectorAll(selectors: string): NodeListOf<Element>;
        getElementById(elementId: string): HTMLElement | null;
      }
      
      interface HTMLElement {
        innerHTML: string;
        style: CSSStyleDeclaration;
        classList: DOMTokenList;
        addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
      }
      
      interface Window {
        addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
        localStorage: Storage;
        fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;
      }

      declare const document: Document;
      declare const window: Window;
      declare const console: Console;
    `,
      "ts:dom.d.ts"
    );
  };

  // Handle editor mounting
  const handleEditorDidMount = (
    editor: MonacoEditor,
    monacoInstance: Monaco
  ) => {
    monaco.current = monacoInstance;
    monacoInstance.editor.setTheme("custom-dark");

    // Force redraw to apply theme correctly
    setTimeout(() => {
      editor.updateOptions({});
    }, 100);
  };

  // Update preview when files change
  const updatePreview = (): void => {
    if (!previewRef.current) return;

    const htmlContent = files.html.content;
    const cssContent = files.css.content;
    const jsContent = files.javascript.content;

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            /* Reset CSS */
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            }
            ${cssContent}
          </style>
        </head>
        <body>
          ${htmlContent}
          <script>${jsContent}</script>
        </body>
      </html>
    `;

    previewRef.current.srcdoc = content;
  };

  // Update preview when files change (if auto-update is enabled)
  useEffect(() => {
    if (autoUpdate) {
      updatePreview();
    }
  }, [files, autoUpdate]);

  // Download project as HTML file
  const downloadProject = (): void => {
    const htmlContent = files.html.content;
    const cssContent = files.css.content;
    const jsContent = files.javascript.content;

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Web Project</title>
          <style>
            ${cssContent}
          </style>
        </head>
        <body>
          ${htmlContent}
          <script>
            ${jsContent}
          </script>
        </body>
      </html>
    `;

    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "web-project.html";
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded",
      description: "Project has been downloaded successfully as HTML file.",
    });
  };

  // Copy HTML to clipboard
  const copyHtmlToClipboard = (): void => {
    const htmlContent = files.html.content;
    const cssContent = files.css.content;
    const jsContent = files.javascript.content;

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Web Project</title>
          <style>
            ${cssContent}
          </style>
        </head>
        <body>
          ${htmlContent}
          <script>
            ${jsContent}
          </script>
        </body>
      </html>
    `;

    navigator.clipboard.writeText(content);

    toast({
      title: "Copied",
      description: "HTML has been copied to clipboard.",
    });
  };

  // Toggle fullscreen mode
  const toggleFullscreen = (): void => {
    setIsFullscreen(!isFullscreen);
  };

  // Get layout configuration based on selected layout
  const getLayoutConfig = (): LayoutConfig => {
    switch (previewLayout) {
      case "bottom":
        return {
          direction: "vertical",
          editorSize: 70,
          previewSize: 30,
        };
      case "right":
        return {
          direction: "horizontal",
          editorSize: 60,
          previewSize: 40,
        };
      default:
        return {
          direction: "horizontal",
          editorSize: 60,
          previewSize: 40,
        };
    }
  };

  // Get current layout configuration
  const config = getLayoutConfig();

  // Return everything needed by the component
  return {
    files,
    config,
    previewRef,
    autoUpdate,
    isFullscreen,
    previewLayout,
    editorFontSize,
    updateFile,
    setAutoUpdate,
    updatePreview,
    downloadProject,
    editorWillMount,
    setPreviewLayout,
    toggleFullscreen,
    copyHtmlToClipboard,
    handleEditorDidMount,
  };
}
