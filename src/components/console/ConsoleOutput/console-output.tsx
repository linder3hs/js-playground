"use client";

import { ConsoleOutput as ConsoleOutputType } from "../types";
import { ConsoleValueViewer } from "../ConsoleValueViewer";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle,
  Bug,
} from "lucide-react";
import { useState } from "react";

interface ConsoleOutputProps {
  output: ConsoleOutputType;
  expandedPaths: Set<string>;
  onToggleExpand: (path: string) => void;
  isSelected: boolean;
  onSelect: (id: string | null) => void;
  onExpandAll: (id: string) => void;
  onCollapseAll: (id: string) => void;
}

export function ConsoleOutput({
  output,
  expandedPaths,
  onToggleExpand,
  isSelected,
  onSelect,
  onExpandAll,
  onCollapseAll,
}: ConsoleOutputProps) {
  const [showTimestamp, setShowTimestamp] = useState(false);

  // Formatear la marca de tiempo
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return (
      date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }) +
      "." +
      date.getMilliseconds().toString().padStart(3, "0")
    );
  };

  // Obtener el icono según el tipo de mensaje
  const getIcon = () => {
    switch (output.type) {
      case "error":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "warn":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "info":
        return <Info className="w-4 h-4 text-blue-400" />;
      case "debug":
        return <Bug className="w-4 h-4 text-purple-400" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-400" />;
    }
  };

  // Determinar las clases de estilo según el tipo de mensaje
  const getOutputClasses = () => {
    const baseClasses = "border-l-2 px-3 py-1 hover:bg-gray-800/60";

    if (isSelected) {
      return `${baseClasses} bg-gray-800 border-l-blue-500`;
    }

    switch (output.type) {
      case "error":
        return `${baseClasses} border-l-red-500`;
      case "warn":
        return `${baseClasses} border-l-yellow-500`;
      case "info":
        return `${baseClasses} border-l-blue-400`;
      case "debug":
        return `${baseClasses} border-l-purple-400`;
      default:
        return `${baseClasses} border-l-green-500`;
    }
  };

  return (
    <div className={getOutputClasses()} onClick={() => onSelect(output.id)}>
      {/* Header con tipo y tiempo */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          {getIcon()}
          <span className="text-xs text-gray-400">{output.type}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Botones de expandir/colapsar */}
          <button
            className="p-1 rounded hover:bg-gray-700 text-gray-400"
            onClick={(e) => {
              e.stopPropagation();
              onExpandAll(output.id);
            }}
            title="Expand all"
          >
            <ChevronDown className="w-3 h-3" />
          </button>

          <button
            className="p-1 rounded hover:bg-gray-700 text-gray-400"
            onClick={(e) => {
              e.stopPropagation();
              onCollapseAll(output.id);
            }}
            title="Collapse all"
          >
            <ChevronUp className="w-3 h-3" />
          </button>

          {/* Toggle timestamp */}
          <button
            className="p-1 rounded hover:bg-gray-700 text-gray-400"
            onClick={(e) => {
              e.stopPropagation();
              setShowTimestamp(!showTimestamp);
            }}
            title="Toggle timestamp"
          >
            <Clock className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Timestamp if shown */}
      {showTimestamp && (
        <div className="text-xs text-gray-500 mb-1">
          {formatTimestamp(output.timestamp)}
        </div>
      )}

      {/* Output values */}
      <div className="overflow-x-auto">
        {output.values.map((value, index) => (
          <ConsoleValueViewer
            key={`${output.id}-${index}`}
            value={value}
            expandedPaths={expandedPaths}
            onToggleExpand={onToggleExpand}
            showKey={output.values.length > 1}
          />
        ))}
      </div>

      {/* Stack trace for errors */}
      {output.type === "error" && output.stack && isSelected && (
        <div className="mt-2 p-2 bg-red-950/20 rounded text-xs text-gray-400 font-mono whitespace-pre-wrap overflow-x-auto">
          {output.stack}
        </div>
      )}
    </div>
  );
}
