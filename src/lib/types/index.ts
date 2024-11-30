export interface EditorConfig {
  theme: string;
  fontSize: number;
  tabSize: number;
  wordWrap: "on" | "off";
  minimap: boolean;
  lineNumbers: "on" | "off";
}

export interface ConsoleOutput {
  type: "log" | "error" | "warn" | "info";
  content: string;
  timestamp: number;
}

export type LayoutOrientation = "horizontal" | "vertical";

export interface WorkspaceState {
  currentFile: string;
  files: Record<string, string>;
  activePanel: "editor" | "console" | "both";
  orientation: LayoutOrientation;
}

export type ConsoleOutputType = "log" | "error" | "warn" | "info";

export type ThemeType = "vs-dark" | "light";

export interface ConsoleOutput {
  type: ConsoleOutputType;
  content: string;
  timestamp: number;
}

export interface EditorConfig {
  theme: string;
  fontSize: number;
  tabSize: number;
  wordWrap: "on" | "off";
  minimap: boolean;
  lineNumbers: "on" | "off";
}

export interface WorkspaceSettings {
  orientation: LayoutOrientation;
  activePanel: "editor" | "console" | "both";
  isSettingsOpen: boolean;
}

export type ActivePanel = "editor" | "console" | "both";
