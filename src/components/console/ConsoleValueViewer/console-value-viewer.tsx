"use client";

import { ProcessedValue, ValueType } from "../types";
import { ChevronDown, ChevronRight } from "lucide-react";

/** Etiqueta del contador según el tipo: items, entries o properties */
function childNoun(type: ValueType, count: number): string {
  const plural = count !== 1;
  if (type === "array" || type === "set") return plural ? "items" : "item";
  if (type === "map") return plural ? "entries" : "entry";
  return plural ? "properties" : "property";
}

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
  const isExpanded = expandedPaths.has(value.path);
  const children = value.children ?? [];

  // Manejar clic para expandir/colapsar
  const handleToggle = () => {
    if (value.hasChildren) {
      onToggleExpand(value.path);
    }
  };

  // Renderizar los hijos si está expandido
  const renderChildren = () => {
    if (!isExpanded || !value.hasChildren) return null;

    if (children.length === 0) {
      return (
        <div className="py-1 pl-4 text-xs text-zinc-400 dark:text-zinc-600">
          Empty {value.type === "array" ? "array" : "object"}
        </div>
      );
    }

    return (
      <div className="pl-4">
        {children.map((child) => (
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

  // Mismos pares claro/oscuro que usa el landing para el código del hero.
  const getValueColor = (type: ValueType): string => {
    switch (type) {
      case "string":
        return "text-emerald-600 dark:text-emerald-400";
      case "number":
      case "bigint":
        return "text-sky-600 dark:text-sky-400";
      case "boolean":
        return "text-violet-600 dark:text-violet-400";
      case "null":
      case "undefined":
        return "text-zinc-400 dark:text-zinc-500";
      case "function":
        return "text-amber-600 dark:text-amber-400";
      case "object":
      case "array":
        return "text-zinc-900 dark:text-zinc-100";
      case "date":
        return "text-pink-600 dark:text-pink-400";
      case "regexp":
        return "text-orange-600 dark:text-orange-400";
      case "error":
        return "text-red-600 dark:text-red-400";
      case "promise":
        return "text-sky-600 dark:text-sky-400";
      case "symbol":
        return "text-orange-600 dark:text-orange-400";
      case "map":
      case "set":
        return "text-teal-600 dark:text-teal-400";
      case "circular":
        return "text-zinc-400 dark:text-zinc-500";
      default:
        return "text-zinc-600 dark:text-zinc-400";
    }
  };

  // Construir la línea de valor
  const renderValue = () => {
    return (
      <div className="flex items-baseline font-mono">
        {value.hasChildren && (
          <button
            className="mr-1 flex items-center text-zinc-400 dark:text-zinc-500"
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
          <span className="mr-1 text-zinc-500 dark:text-zinc-400">
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
            <span className="ml-1 text-[11px] text-zinc-400 dark:text-zinc-600">
              ({value.childrenCount} {childNoun(value.type, value.childrenCount)}
              )
            </span>
          )}
      </div>
    );
  };

  return (
    <div className="console-value rounded py-0.5">
      {renderValue()}
      {renderChildren()}
    </div>
  );
}
