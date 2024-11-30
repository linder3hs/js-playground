// src/store/editor-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  WorkspaceState,
  EditorConfig,
  ConsoleOutput,
  LayoutOrientation,
  ActivePanel,
} from "@/lib/types";

interface EditorStore extends WorkspaceState {
  config: EditorConfig;
  output: ConsoleOutput[];
  setOrientation: (orientation: LayoutOrientation) => void;
  setActivePanel: (panel: ActivePanel) => void;
  updateFile: (filename: string, content: string) => void;
  addOutput: (output: Omit<ConsoleOutput, "timestamp">) => void;
  clearOutput: () => void;
  updateConfig: (config: Partial<EditorConfig>) => void;
}

const DEFAULT_CONFIG: EditorConfig = {
  theme: "vs-dark",
  fontSize: 14,
  tabSize: 2,
  wordWrap: "on",
  minimap: false,
  lineNumbers: "on",
};

const DEFAULT_WORKSPACE_STATE: WorkspaceState = {
  currentFile: "index.js",
  files: {
    "index.js": '// Welcome to JS Playground\nconsole.log("Hello World!");',
  },
  activePanel: "both",
  orientation: "horizontal",
};

export const useEditorStore = create<EditorStore>()(
  persist(
    (set) => ({
      ...DEFAULT_WORKSPACE_STATE,
      config: DEFAULT_CONFIG,
      output: [],

      setOrientation: (orientation) => set({ orientation }),

      setActivePanel: (panel) => set({ activePanel: panel }),

      updateFile: (filename, content) =>
        set((state) => ({
          files: { ...state.files, [filename]: content },
        })),

      addOutput: (output) =>
        set((state) => ({
          output: [...state.output, { ...output, timestamp: Date.now() }],
        })),

      clearOutput: () => set({ output: [] }),

      updateConfig: (config) =>
        set((state) => ({
          config: { ...state.config, ...config },
        })),
    }),
    {
      name: "js-playground-storage",
      partialize: (state) => ({
        files: state.files,
        config: state.config,
        orientation: state.orientation,
        activePanel: state.activePanel,
      }),
    }
  )
);
