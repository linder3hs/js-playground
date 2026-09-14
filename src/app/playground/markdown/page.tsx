import { MarkdownPlayground } from "@/markdown-playground";

// El playground ya ocupa la pantalla completa; envolverlo sumaba una franja
// muerta al pie, igual que pasaba en JS/TS.
export default function MarkdownPage() {
  return <MarkdownPlayground />;
}
