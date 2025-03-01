export interface MarkdownCell {
  content: string;
  align?: "left" | "center" | "right" | null;
  isHeader?: boolean;
  rowspan?: number;
  colspan?: number;
}

export interface MarkdownHeader {
  cells: MarkdownCell[];
  id?: string;
}

export interface MarkdownRow {
  cells: MarkdownCell[];
  id?: string;
  isHeader?: boolean;
}

export interface MarkdownTable {
  header?: MarkdownHeader;
  rows: MarkdownRow[];
  id?: string;
}

export interface MarkdownTableOptions {
  pretty?: boolean;
  alignDelimiters?: boolean;
  paddingCharacter?: string;
  useHeaderSeparator?: boolean;
  separator?: string;
}
