import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FileType, WebPlaygroundState } from "@/lib/types";

interface WebPlaygroundStore extends WebPlaygroundState {
  updateFile: (type: FileType, content: string) => void;
}

const DEFAULT_STATE: WebPlaygroundState = {
  files: {
    html: {
      id: "html-editor",
      type: "html",
      content: "",
    },
    css: {
      id: "css-editor",
      type: "css",
      content: "",
    },
    javascript: {
      id: "js-editor",
      type: "javascript",
      content: 'console.log("Hello from JS!");',
    },
  },
};

export const useWebPlaygroundStore = create<WebPlaygroundStore>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,
      updateFile: (type, content) =>
        set((state) => ({
          files: {
            ...state.files,
            [type]: {
              ...state.files[type],
              content,
            },
          },
        })),
    }),
    {
      name: "web-playground-storage",
    }
  )
);
