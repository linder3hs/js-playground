"use client";

import { ProcessedValue, ValueType } from "../types";
import { processChildren } from "@/lib/utils/console-formatter";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

interface ConsoleValueViewerProps {
  value: ProcessedValue;
  expandedPaths: Set<string>;
  onToggleExpand: (path: string) => void;
  showKey?: boolean;
}

export function ConsoleValueViewer({
  value,
  expandedPaths,
  onToggleExpand,
  showKey = true,
}: ConsoleValueViewerProps) {
  const [expandedChildren, setExpandedChildren] = useState<ProcessedValue[]>(
    []
  );
  const [childrenLoaded, setChildrenLoaded] = useState(false);

  const isExpanded = expandedPaths.has(value.path);

  // Cargar los hijos cuando se expande el nodo por primera vez
  useEffect(() => {
    if (isExpanded && value.hasChildren && !childrenLoaded) {
      // Asegurarse de que value.value existe y es válido
      if (value.value !== undefined && value.value !== null) {
        try {
          const children = processChildren(
            value.value,
            value.type,
            value.path,
            value.depth,
            { maxDepth: 10, initialExpandLevel: 1 }
          );
          setExpandedChildren(children);
          setChildrenLoaded(true);
        } catch (error) {
          console.error("Error processing children:", error);
          setExpandedChildren([
            {
              type: "error",
              value: "Error loading children",
              depth: value.depth + 1,
              path: `${value.path}.error`,
              id: `error_${Date.now()}`,
            },
          ]);
          setChildrenLoaded(true);
        }
      }
    }
  }, [isExpanded, value, childrenLoaded]);

  // Manejar clic para expandir/colapsar
  const handleToggle = () => {
    if (value.hasChildren) {
      onToggleExpand(value.path);
    }
  };

  // Renderizar los hijos si está expandido
  const renderChildren = () => {
    if (!isExpanded || !value.hasChildren) return null;

    if (!childrenLoaded) {
      return <div className="pl-4 text-gray-400 text-xs py-1">Loading...</div>;
    }

    if (expandedChildren.length === 0) {
      return (
        <div className="pl-4 text-gray-400 text-xs py-1">
          Empty {value.type === "array" ? "array" : "object"}
        </div>
      );
    }

    return (
      <div className="pl-4">
        {expandedChildren.map((child) => (
          <ConsoleValueViewer
            key={child.id}
            value={child}
            expandedPaths={expandedPaths}
            onToggleExpand={onToggleExpand}
            showKey={true}
          />
        ))}
      </div>
    );
  };

  // Obtener el color del valor según el tipo
  const getValueColor = (type: ValueType): string => {
    switch (type) {
      case "string":
        return "text-green-400";
      case "number":
        return "text-blue-400";
      case "boolean":
        return "text-purple-400";
      case "null":
      case "undefined":
        return "text-red-400";
      case "function":
        return "text-yellow-400";
      case "object":
      case "array":
        return "text-white";
      case "date":
        return "text-pink-400";
      case "regexp":
        return "text-yellow-300";
      case "error":
        return "text-red-500";
      case "promise":
        return "text-blue-300";
      case "symbol":
        return "text-orange-400";
      case "bigint":
        return "text-blue-300";
      case "map":
      case "set":
        return "text-cyan-400";
      case "circular":
        return "text-gray-400";
      default:
        return "text-gray-300";
    }
  };

  // Construir la línea de valor
  const renderValue = () => {
    return (
      <div className="flex items-baseline font-mono">
        {value.hasChildren && (
          <button
            className="mr-1 text-gray-400 flex items-center"
            onClick={handleToggle}
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </button>
        )}

        {/* Añadir espaciado para valores sin hijos para alinear */}
        {!value.hasChildren && <span className="w-3 mr-1"></span>}

        {showKey && value.key !== undefined && (
          <span className="text-violet-400 mr-1">
            {typeof value.key === "string"
              ? `${value.key}: `
              : `[${value.key}]: `}
          </span>
        )}

        <span className={`${getValueColor(value.type)} whitespace-pre-wrap`}>
          {value.preview || String(value.value)}
        </span>

        {value.hasChildren &&
          !isExpanded &&
          value.childrenCount !== undefined && (
            <span className="text-gray-500 ml-1 text-xs">
              {value.type === "array"
                ? `(${value.childrenCount} ${
                    value.childrenCount === 1 ? "item" : "items"
                  })`
                : `(${value.childrenCount} ${
                    value.childrenCount === 1 ? "property" : "properties"
                  })`}
            </span>
          )}
      </div>
    );
  };

  return (
    <div className="console-value py-0.5 hover:bg-gray-800/50 rounded transition-colors">
      {renderValue()}
      {renderChildren()}
    </div>
  );
}
