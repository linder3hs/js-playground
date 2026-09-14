import { MarkdownPlayground } from "@/markdown-playground";

// The playground already fills the viewport; wrapping it added a dead strip
// at the bottom, the same way it did in JS/TS.
export default function MarkdownPage() {
  return <MarkdownPlayground />;
}
