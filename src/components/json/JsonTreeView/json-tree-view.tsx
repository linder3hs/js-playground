"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { JSONNode } from "@/lib/utils/json-formatter";
import {
  getValueStyle,
  formatValueForDisplay,
} from "@/lib/utils/json-formatter";
import type { JSX, RefObject } from "react";

interface JsonTreeViewProps {
  jsonTree: JSONNode[];
  expandedPaths: Set<string>;
  toggleNode: (path: string) => void;
  jsonError: string | null;
  containerRef: RefObject<HTMLDivElement>;
}

export function JsonTreeView({
  jsonTree,
  expandedPaths,
  toggleNode,
  jsonError,
  containerRef,
}: JsonTreeViewProps) {
  const renderJsonNode = (node: JSONNode): JSX.Element => {
    const isExpanded = expandedPaths.has(node.path);
    const hasChildren = !!node.children && node.children.length > 0;
    const valueStyle = getValueStyle(node.value);

    return (
      <div key={node.path}>
        <div
          className="flex items-center rounded py-0.5 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          onClick={() => hasChildren && toggleNode(node.path)}
          style={{
            paddingLeft: `${node.depth * 14}px`,
            cursor: hasChildren ? "pointer" : "default",
          }}
        >
          <span className="mr-1 flex h-4 w-4 shrink-0 items-center justify-center text-zinc-400 dark:text-zinc-600">
            {hasChildren &&
              (isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              ))}
          </span>

          <span className="text-purple-600 dark:text-purple-400">
            {JSON.stringify(node.key)}
          </span>
          <span className="text-zinc-400 dark:text-zinc-600">:&nbsp;</span>

          {hasChildren ? (
            <span className="text-zinc-500">
              {node.type === "array" ? "Array" : "Object"}
              <span className="ml-1 text-zinc-400 dark:text-zinc-600">
                ({node.children?.length}
                {node.children?.length === 1 ? " item" : " items"})
              </span>
            </span>
          ) : (
            <span className={valueStyle}>
              {formatValueForDisplay(node.value)}
            </span>
          )}
        </div>

        {isExpanded &&
          node.children?.map((child) => renderJsonNode(child))}
      </div>
    );
  };

  // El error ya lo muestra la cabecera del panel; acá sólo se explica por qué
  // el árbol quedó vacío.
  if (jsonError || jsonTree.length === 0) {
    return (
      <div className="flex-1 px-3 py-2 text-xs text-zinc-500">
        {jsonError
          ? "Fix the error to see the tree."
          : "The tree appears as you type."}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-auto px-3 py-2 font-mono text-[13px] leading-relaxed"
    >
      {jsonTree.map((node) => renderJsonNode(node))}
    </div>
  );
}
