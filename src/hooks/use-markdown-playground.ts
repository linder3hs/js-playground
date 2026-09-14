import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { Marked } from "marked";
import Prism from "prismjs";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-json";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-python";
import { useToast } from "@/hooks/use-toast";
import type { LayoutOrientation } from "@/lib/types";

// Default markdown content
const DEFAULT_MARKDOWN = `# Markdown Editor

Live preview with **GitHub Flavored Markdown**: tables, task lists,
~~strikethrough~~ and autolinks like https://github.com.

## Checklist

- [x] Fenced code with highlighting
- [ ] Nested lists
  - like this one

\`\`\`js
const greet = (name) => \`Hello, \${name}!\`;
console.log(greet("world"));
\`\`\`

| Feature | Supported |
| ------- | :-------: |
| Tables  |     ✓     |
| Task lists |  ✓     |

> **Note**: rendered with \`marked\`, the same GFM rules GitHub uses.
`;

/**
 * El preview usaba un parser a mano de ~90 líneas de regex: metía bloques
 * dentro de `<p>`, duplicaba el cuerpo de los fences, aplicaba `**negrita**`
 * dentro del código y no conocía task lists, strikethrough ni listas
 * anidadas. `marked` trae GFM (tablas, tachado, autolinks, task lists) de
 * fábrica, en una sola dependencia sin deps transitivas.
 *
 * GitHub renderiza con cmark-gfm; lo más fiel en JS sería remark-gfm, pero
 * arrastra el stack de unified entero para diferencias que este preview no
 * alcanza a notar.
 */
const marked = new Marked({
  gfm: true,
  breaks: false,
  renderer: {
    // Prism ya estaba en el proyecto, pero el resaltado nunca corría: el
    // parser viejo inyectaba un `<script>` con `Prism.highlightAll()` sobre
    // una librería que nadie importaba.
    code({ text, lang }) {
      const grammar = lang && Prism.languages[lang];
      const body = grammar
        ? Prism.highlight(text, grammar, lang as string)
        : escapeHtml(text);
      return `<pre><code class="language-${escapeHtml(
        lang || "text"
      )}">${body}</code></pre>`;
    },
  },
});

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export interface UseMarkdownPlaygroundOptions {
  initialMarkdown?: string;
}

export function useMarkdownPlayground(options?: UseMarkdownPlaygroundOptions) {
  const { toast } = useToast();
  const [markdown, setMarkdown] = useState<string>(
    options?.initialMarkdown || DEFAULT_MARKDOWN
  );

  const { resolvedTheme } = useTheme();

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [autoUpdate, setAutoUpdate] = useState<boolean>(true);
  const [orientation, setOrientation] = useState<LayoutOrientation>("horizontal");
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
    previewRef.current.innerHTML = marked.parse(markdown) as string;
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
    orientation,
    editorFontSize,
    previewRef,
    editorTheme: (resolvedTheme === "light" ? "light" : "dark") as
      | "light"
      | "dark",
    toggleFullscreen,
    setAutoUpdate,
    setOrientation,
    downloadMarkdown,
    copyMarkdown,
    updatePreview,
  };
}
