import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useEditorStore } from "@/store/editor-store";

export const ConsoleToolbar = () => {
  const { clearOutput } = useEditorStore();

  return (
    <div className="flex items-center gap-2 p-2 border-b">
      <Button variant="outline" onClick={clearOutput}>
        <Trash2 size={16} />
      </Button>
    </div>
  );
};
