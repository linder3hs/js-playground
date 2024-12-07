/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";
import { useEditorStore } from "@/store/editor-store";
import { ConsoleOutput } from "@/lib/types";
import { Trash2 } from "lucide-react";
import Prism from "prismjs";
import "prismjs/components/prism-json";
import "prismjs/components/prism-javascript";
import { customPrismStyles } from "./styles";

export const OutputPanel = () => {
  const { output, clearOutput } = useEditorStore();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
      Prism.highlightAll();
    }
  }, [output]);

  const stringifyValue = (value: any): string => {
    if (value === undefined) return "undefined";
    if (value === null) return "null";
    if (typeof value === "string") return `"${value}"`;
    if (typeof value === "function") {
      return value.toString().replace(/\{[\s\S]*\}/, "{ [Function] }");
    }
    if (Array.isArray(value) || typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const getOutputElement = (
    content: any,
    _type: ConsoleOutput["type"]
  ): JSX.Element => {
    const stringValue = stringifyValue(content);
    console.log(_type);
    let language = "javascript";
    if (typeof content === "object") {
      language = "json";
    }

    return (
      <pre className="my-0 bg-transparent">
        <code className={`language-${language} !bg-transparent`}>
          {stringValue}
        </code>
      </pre>
    );
  };

  const getOutputPrefix = (type: ConsoleOutput["type"]): JSX.Element => {
    const baseClass = "select-none mr-2 font-mono";
    switch (type) {
      case "error":
        return <span className={`${baseClass} text-red-400`}>[error]</span>;
      case "warn":
        return <span className={`${baseClass} text-yellow-400`}>[warn]</span>;
      default:
        return <span className={`${baseClass} text-gray-500`}>[log]</span>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0E1525] font-mono text-sm">
      <style>{customPrismStyles}</style>
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800">
        <span className="text-gray-400 text-xs uppercase tracking-wider">
          Console
        </span>
        {output.length > 0 && (
          <button
            onClick={clearOutput}
            className="p-1 hover:bg-gray-800 rounded transition-colors"
            title="Clear console"
          >
            <Trash2 className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>
      <div ref={containerRef} className="flex-1 overflow-auto">
        {output.map((item, index) => (
          <div
            key={`${item.timestamp}-${index}`}
            className="border-b border-gray-800/50 last:border-0 hover:bg-gray-900/50"
          >
            <div className="px-3 py-2 font-mono text-sm flex items-start gap-2">
              {getOutputPrefix(item.type)}
              <div className="flex-1 overflow-x-auto">
                {getOutputElement(item.content, item.type)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
