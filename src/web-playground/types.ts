import { Monaco, OnMount } from "@monaco-editor/react";

export interface FileContent {
  content: string;
}

export interface StoreFiles {
  html: FileContent;
  css: FileContent;
  javascript: FileContent;
}

export interface WebPlaygroundStore {
  files: StoreFiles;
  updateFile: (
    fileType: "html" | "css" | "javascript",
    content: string
  ) => void;
}

export interface LayoutConfig {
  direction: "horizontal" | "vertical";
  editorSize: number;
  previewSize: number;
}

export interface MonacoModel {
  getValueInRange: (range: {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
  }) => string;
  getLineContent: (lineNumber: number) => string;
}

export interface MonacoPosition {
  lineNumber: number;
  column: number;
}

export interface EmmetSuggestion {
  trigger: string;
  snippet: string;
}

export interface MenuItem {
  label?: string;
  action?: () => void;
  icon?: string;
  type?: string;
}

export type EditorWillMountHandler = (monaco: Monaco) => void;

export type MonacoEditor = Parameters<OnMount>[0];
