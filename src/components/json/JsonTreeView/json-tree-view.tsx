"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { JSONNode } from "@/lib/utils/json-formatter";
import {
  getValueStyle,
  formatValueForDisplay,
} from "@/lib/utils/json-formatter";
import { RefObject } from "react";

interface JsonTreeViewProps {
  jsonTree: JSONNode[];
  expandedPaths: Set<string>;
  toggleNode: (path: string) => void;
  jsonError: string | null;
  containerRef: RefObject<HTMLDivElement>;
  autoUpdate: boolean;
  onUpdate?: () => void;
}

export function JsonTreeView({
  jsonTree,
  expandedPaths,
  toggleNode,
  jsonError,
  containerRef,
  autoUpdate,
  onUpdate,
}: JsonTreeViewProps) {
  // Render a single JSON node
  const renderJsonNode = (node: JSONNode): JSX.Element => {
    const isExpanded = expandedPaths.has(node.path);
    const hasChildren = node.children && node.children.length > 0;
    const indent = `${node.depth * 16}px`;

    // Calculate value style and display format
    const valueStyle = getValueStyle(node.value);
    const valueDisplay: React.ReactNode = formatValueForDisplay(node.value);

    return (
      <div key={node.path}>
        <div
          className="flex items-center py-1 hover:bg-gray-800 rounded cursor-pointer"
          onClick={() => hasChildren && toggleNode(node.path)}
          style={{ paddingLeft: indent }}
        >
          {hasChildren ? (
            <div className="mr-1 text-gray-400">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          ) : (
            <div className="w-4 mr-1"></div>
          )}

          <div className="flex items-center">
            <span className="text-purple-400 font-medium">
              {JSON.stringify(node.key)}:{" "}
            </span>
            {!hasChildren && <span className={valueStyle}>{valueDisplay}</span>}
            {hasChildren && (
              <span className="text-gray-400 ml-1">
                {node.type === "array" ? "Array" : "Object"}
                <span className="text-gray-500 text-xs ml-1">
                  ({node.children?.length}{" "}
                  {node.children && node.children.length === 1
                    ? "item"
                    : "items"}
                  )
                </span>
              </span>
            )}
          </div>
        </div>

        {isExpanded &&
          hasChildren &&
          node.children?.map((child) => renderJsonNode(child))}
      </div>
    );
  };

  // Empty state
  if (jsonTree.length === 0 && !jsonError) {
    return (
      <div className="text-gray-400 flex items-center justify-center h-full">
        Enter valid JSON in the editor to see the tree view
      </div>
    );
  }

  // Error state
  if (jsonError) {
    return (
      <div className="text-red-400 p-4 bg-red-900/20 rounded">
        <strong>JSON Error:</strong> {jsonError}
      </div>
    );
  }

  // Tree view state
  return (
    <div
      ref={containerRef}
      className="h-full overflow-auto p-4 font-mono text-sm"
    >
      {!autoUpdate && onUpdate && (
        <div className="absolute inset-0 bg-gray-900/70 flex items-center justify-center pointer-events-none">
          <button
            onClick={onUpdate}
            className="pointer-events-auto bg-gray-800 text-gray-100 hover:bg-gray-700 px-4 py-2 rounded flex items-center gap-2"
          >
            <ChevronRight className="w-4 h-4" />
            Click to Update
          </button>
        </div>
      )}

      {jsonTree.map((node) => renderJsonNode(node))}
    </div>
  );
}
