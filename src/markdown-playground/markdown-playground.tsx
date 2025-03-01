"use client";

import { useState, useRef, useEffect } from "react";
import { Editor } from "@monaco-editor/react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Play, Download, Copy, Maximize, Minimize } from "lucide-react";
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

// Extend Window interface to include Monaco
declare global {
  interface Window {
    monaco?: any;
  }
}

export function MarkdownPlayground() {
  const { toast } = useToast();
  const [markdown, setMarkdown] = useState<string>(`# Markdown Editor
  
## Welcome to JS Playground Markdown Editor

This is a simple markdown editor with live preview. You can:

> **Note**: This editor supports GitHub Flavored Markdown.
`);

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [autoUpdate, setAutoUpdate] = useState<boolean>(true);
  const [previewLayout, setPreviewLayout] = useState<"right" | "left">("right");
  const [editorFontSize] = useState<number>(14);

  const previewRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = (): void => {
    setIsFullscreen(!isFullscreen);
  };

  const downloadMarkdown = (): void => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.md";
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded",
      description: "Markdown file has been downloaded successfully.",
    });
  };

  const copyMarkdown = (): void => {
    navigator.clipboard.writeText(markdown);

    toast({
      title: "Copied",
      description: "Markdown has been copied to clipboard.",
    });
  };

  const updatePreview = (): void => {
    if (!previewRef.current) return;

    // We'll use a simple markdown parser here
    // In a real app, you might want to use a more robust solution like marked or remark
    const html = parseMarkdown(markdown);
    previewRef.current.innerHTML = html;

    // Apply syntax highlighting to code blocks
    const prismScript = document.createElement("script");
    prismScript.textContent = `
      if (typeof Prism !== 'undefined') {
        Prism.highlightAll();
      }
    `;
    previewRef.current.appendChild(prismScript);

    // Render math if MathJax is available
    const mathJaxScript = document.createElement("script");
    mathJaxScript.textContent = `
      if (typeof MathJax !== 'undefined') {
        MathJax.typeset();
      }
    `;
    previewRef.current.appendChild(mathJaxScript);
  };

  // Simple markdown parser (in a real app, use a library)
  const parseMarkdown = (md: string): string => {
    // This is a very simple parser and doesn't handle all markdown features
    let html = md;

    // Headers
    html = html.replace(/^# (.*$)/gm, "<h1>$1</h1>");
    html = html.replace(/^## (.*$)/gm, "<h2>$1</h2>");
    html = html.replace(/^### (.*$)/gm, "<h3>$1</h3>");
    html = html.replace(/^#### (.*$)/gm, "<h4>$1</h4>");
    html = html.replace(/^##### (.*$)/gm, "<h5>$1</h5>");
    html = html.replace(/^###### (.*$)/gm, "<h6>$1</h6>");

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/__(.*?)__/g, "<strong>$1</strong>");

    // Italic
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
    html = html.replace(/_(.*?)_/g, "<em>$1</em>");

    // Code blocks
    html = html.replace(
      /\`\`\`([\s\S]*?)\`\`\`/g,
      '<pre><code class="language-$1">$1</code></pre>'
    );

    // Inline code
    html = html.replace(/\`(.*?)\`/g, "<code>$1</code>");

    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

    // Images
    html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img alt="$1" src="$2" />');

    // Lists
    html = html.replace(/^\* (.*$)/gm, "<ul><li>$1</li></ul>");
    html = html.replace(/^- (.*$)/gm, "<ul><li>$1</li></ul>");
    html = html.replace(/^(\d+)\. (.*$)/gm, "<ol><li>$2</li></ol>");

    // Fix lists (this is a simplistic approach)
    html = html.replace(/<\/ul><ul>/g, "");
    html = html.replace(/<\/ol><ol>/g, "");

    // Blockquotes
    html = html.replace(/^> (.*$)/gm, "<blockquote>$1</blockquote>");
    html = html.replace(/<\/blockquote><blockquote>/g, "<br/>");

    // Paragraphs
    html = html.replace(/\n\s*\n/g, "</p><p>");
    html = "<p>" + html + "</p>";

    // Tables (very simple implementation)
    const tableRegex = /\|(.+)\|\n\|(?:[-:]+\|)+\n((?:\|.+\|\n)+)/g;
    html = html.replace(tableRegex, (match, headers, rows) => {
      const headerCells = headers
        .split("|")
        .filter((cell: string) => cell.trim() !== "");
      const tableRows = rows.trim().split("\n");

      let tableHtml = '<table class="md-table"><thead><tr>';
      headerCells.forEach((header: string) => {
        tableHtml += `<th>${header.trim()}</th>`;
      });
      tableHtml += "</tr></thead><tbody>";

      tableRows.forEach((row: string) => {
        tableHtml += "<tr>";
        const cells = row
          .split("|")
          .filter((cell: string) => cell.trim() !== "");
        cells.forEach((cell: string) => {
          tableHtml += `<td>${cell.trim()}</td>`;
        });
        tableHtml += "</tr>";
      });

      tableHtml += "</tbody></table>";
      return tableHtml;
    });

    // Math expressions (for rendering with MathJax)
    html = html.replace(
      /\$\$([\s\S]*?)\$\$/g,
      '<div class="math">$$$$1$$</div>'
    );
    html = html.replace(/\$(.*?)\$/g, '<span class="math">\\($1\\)</span>');

    return html;
  };

  // Update the preview when markdown changes
  useEffect(() => {
    if (autoUpdate) {
      updatePreview();
    }
  }, [markdown, autoUpdate]);

  // Force Monaco editor theme to apply correctly after initial render
  useEffect(() => {
    // Add a small timeout to ensure the editor is fully mounted
    const timer = setTimeout(() => {
      const editorElement = document.querySelector(".monaco-editor");
      if (editorElement) {
        // Force a redraw by toggling a class
        editorElement.classList.add("force-dark-theme");
        // Monaco global object might be available in window
        if (window.monaco) {
          window.monaco.editor.setTheme("vs-dark-custom");
        }
      }
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  // Configure Monaco editor
  const editorWillMount = (monaco: Monaco) => {
    monaco.languages.register({ id: "markdown" });

    // Definir un tema oscuro personalizado
    monaco.editor.defineTheme("vs-dark-custom", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#1E1E1E",
        "editor.foreground": "#D4D4D4",
        "editor.lineHighlightBackground": "#2D2D30",
        "editor.selectionBackground": "#264F78",
        "editor.inactiveSelectionBackground": "#3A3D41",
        "editorLineNumber.foreground": "#858585",
      },
    });

    // Establecer como tema por defecto
    monaco.editor.setTheme("vs-dark-custom");
  };


  // Force the theme to be applied correctly on mount
  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    monaco.editor.setTheme("vs-dark-custom");

    // Force redraw the editor to apply theme correctly
    setTimeout(() => {
      editor.updateOptions({});
      monaco.editor.setTheme("vs-dark-custom");
    }, 100);
  };

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
      <div className="flex items-center justify-between bg-gray-950 px-4 py-2 border-b border-gray-700 shadow-sm">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-100">
            Markdown Editor
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
              onValueChange={(value: "right" | "left") =>
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
                  value="left"
                  className="focus:bg-gray-700 focus:text-gray-100"
                >
                  Left
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
                  onClick={updatePreview}
                  className="border-gray-700 bg-gray-800 text-gray-100 hover:bg-gray-700"
                >
                  <Play className="w-4 h-4 mr-2 text-gray-300" />
                  Update
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Update preview</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadMarkdown}
                  className="border-gray-700 bg-gray-800 text-gray-100 hover:bg-gray-700"
                >
                  <Download className="w-4 h-4 mr-2 text-gray-300" />
                  Download
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download as Markdown file</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyMarkdown}
                  className="border-gray-700 bg-gray-800 text-gray-100 hover:bg-gray-700"
                >
                  <Copy className="w-4 h-4 mr-2 text-gray-300" />
                  Copy
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy Markdown to clipboard</p>
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
        direction={config.direction as "horizontal" | "vertical"}
        className="bg-gray-900"
      >
        {previewLayout === "left" && (
          <ResizablePanel defaultSize={config.previewSize}>
            <div className="h-full bg-gray-900 flex flex-col overflow-hidden border border-gray-900 shadow-sm">
              <div className="bg-gray-950 px-4 py-2 border-b border-gray-900 flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-200">Previewsss</h3>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={updatePreview}
                    title="Refresh Preview"
                    className="text-gray-300 hover:bg-gray-700"
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="w-full h-full bg-gray-900 overflow-auto p-4">
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
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={updatePreview}
                    title="Refresh Preview"
                    className="text-gray-300 hover:bg-gray-700"
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="w-full h-full bg-gray-900 overflow-auto p-4">
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

      {/* Add CSS for markdown preview and monaco editor */}
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
