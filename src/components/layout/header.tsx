import { Button } from "@/components/ui/button";
import { Layout, Settings } from "lucide-react";
import { useEditorStore } from "@/store/editor-store";
import { LayoutOrientation } from "@/lib/types";

export const Header = () => {
  const { orientation, setOrientation } = useEditorStore();

  const toggleLayout = (): void => {
    const newOrientation: LayoutOrientation =
      orientation === "horizontal" ? "vertical" : "horizontal";
    setOrientation(newOrientation);
  };

  return (
    <header className="flex items-center justify-between p-4 border-b">
      <h1 className="text-2xl font-bold">JS Playground</h1>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={toggleLayout}>
          <Layout size={16} />
        </Button>
        <Button variant="outline">
          <Settings size={16} />
        </Button>
      </div>
    </header>
  );
};
