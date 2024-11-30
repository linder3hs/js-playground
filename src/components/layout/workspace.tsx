import { MonacoEditor } from "../editor/monaco-editor";
import { EditorToolbar } from "../editor/editor-toolbar";
import { OutputPanel } from "../console/output-panel";
import { ConsoleToolbar } from "../console/console-toolbar";
import { useEditorStore } from "@/store/editor-store";

export const Workspace = () => {
  const { orientation } = useEditorStore();

  return (
    <div
      className={`flex ${
        orientation === "horizontal" ? "flex-row" : "flex-col"
      } h-[calc(100vh-4rem)] gap-4 p-4`}
    >
      <div className="flex-1 min-w-0 flex flex-col border rounded-lg overflow-hidden">
        <EditorToolbar />
        <div className="flex-1 min-h-0">
          <MonacoEditor />
        </div>
      </div>
      <div className="flex-1 min-w-0 flex flex-col border rounded-lg overflow-hidden">
        <ConsoleToolbar />
        <OutputPanel />
      </div>
    </div>
  );
};
