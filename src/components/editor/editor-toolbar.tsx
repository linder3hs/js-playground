import { Button } from "@/components/ui/button";
import { Play, Save, Copy } from "lucide-react";
import { useEditorStore } from "@/store/editor-store";
import { executeCode } from "@/lib/utils/code-executor";

export const EditorToolbar = () => {
  const { files, currentFile, addOutput, clearOutput } = useEditorStore();

  const handleRunCode = async (): Promise<void> => {
    clearOutput();
    try {
      await executeCode(files[currentFile], addOutput);
    } catch (error) {
      if (error instanceof Error) {
        addOutput({
          type: "error",
          content: error.message,
        });
      }
    }
  };

  const handleCopyCode = (): void => {
    navigator.clipboard.writeText(files[currentFile]);
  };

  return (
    <div className="flex items-center gap-2 p-2 border-b">
      <Button onClick={handleRunCode} className="flex items-center gap-2">
        <Play size={16} />
        Ejecutar
      </Button>
      <Button variant="outline" onClick={handleCopyCode}>
        <Copy size={16} />
      </Button>
      <Button variant="outline">
        <Save size={16} />
      </Button>
    </div>
  );
};
