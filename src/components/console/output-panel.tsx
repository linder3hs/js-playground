import { useEditorStore } from "@/store/editor-store";
import { ConsoleOutput } from "@/lib/types";

export const OutputPanel = () => {
  const { output } = useEditorStore();

  const getOutputClassName = (type: ConsoleOutput["type"]): string => {
    const baseClass = "mb-1";
    switch (type) {
      case "error":
        return `${baseClass} text-red-600`;
      case "warn":
        return `${baseClass} text-yellow-600`;
      default:
        return `${baseClass} text-gray-900 dark:text-gray-100`;
    }
  };

  return (
    <div className="h-full overflow-auto bg-gray-50 dark:bg-gray-900 font-mono text-sm p-4">
      {output.map((item, index) => (
        <div
          key={`${item.timestamp}-${index}`}
          className={getOutputClassName(item.type)}
        >
          <span className="opacity-50">{`[${item.type}]`}</span> {item.content}
        </div>
      ))}
    </div>
  );
};
