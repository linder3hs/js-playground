import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Monaco } from "@monaco-editor/react";
import { MonacoEditor } from "@/web-playground/types";

// Default markdown content
const DEFAULT_MARKDOWN = `# Markdown Editor

## Welcome to JS Playground Markdown Editor

This is a simple markdown editor with live preview. You can:

> **Note**: This editor supports GitHub Flavored Markdown.
`;

export interface UseMarkdownPlaygroundOptions {
  initialMarkdown?: string;
}

export function useMarkdownPlayground(options?: UseMarkdownPlaygroundOptions) {
  const { toast } = useToast();
  const [markdown, setMarkdown] = useState<string>(
    options?.initialMarkdown || DEFAULT_MARKDOWN
  );

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [autoUpdate, setAutoUpdate] = useState<boolean>(true);
  const [previewLayout, setPreviewLayout] = useState<"right" | "left">("right");
  const [editorFontSize] = useState<number>(14);

  const previewRef = useRef<HTMLDivElement>(null);

  // Toggle fullscreen mode
  const toggleFullscreen = (): void => {
    setIsFullscreen(!isFullscreen);
  };

  // Download markdown as file
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

  // Copy markdown to clipboard
  const copyMarkdown = (): void => {
    navigator.clipboard.writeText(markdown);

    toast({
      title: "Copied",
      description: "Markdown has been copied to clipboard.",
    });
  };

  // Update preview with parsed markdown
  const updatePreview = (): void => {
    if (!previewRef.current) return;

    // Parse markdown to HTML
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

  // Configure Monaco editor
  const editorWillMount = (monaco: Monaco) => {
    monaco.languages.register({ id: "markdown" });

    // Custom dark theme
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

    monaco.editor.setTheme("vs-dark-custom");
  };

  // Handle editor mounting
  const handleEditorDidMount = (editor: MonacoEditor, monaco: Monaco) => {
    monaco.editor.setTheme("vs-dark-custom");

    // Force redraw for theme
    setTimeout(() => {
      editor.updateOptions({});
      monaco.editor.setTheme("vs-dark-custom");
    }, 100);
  };

  // Update preview when markdown changes
  useEffect(() => {
    if (autoUpdate) {
      updatePreview();
    }
  }, [markdown, autoUpdate]);

  // Return everything needed by the component
  return {
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
  };
}
