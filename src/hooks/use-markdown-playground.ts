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
 * The preview used a hand-rolled parser of ~90 lines of regex: it nested
 * block elements inside `<p>`, duplicated the body of fenced code, applied
 * `**bold**` inside code spans and knew nothing about task lists,
 * strikethrough or nested lists. `marked` brings GFM (tables, strikethrough,
 * autolinks, task lists) out of the box, in one dependency with no transitive
 * deps.
 *
 * GitHub renders with cmark-gfm; the most faithful port in JS would be
 * remark-gfm, but it drags in the whole unified stack for differences this
 * preview never gets close to noticing.
 */
const marked = new Marked({
  gfm: true,
  breaks: false,
  renderer: {
    // Prism was already in the project, but highlighting never ran: the old
    // parser injected a `<script>` calling `Prism.highlightAll()` against a
    // library nobody imported.
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
