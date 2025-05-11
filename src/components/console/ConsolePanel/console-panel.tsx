"use client";

import {
  XCircle,
  Filter,
  AlertTriangle,
  AlertCircle,
  Info,
  MessageCircle,
  Bug,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { ConsoleOutput } from "../ConsoleOutput";
import { ConsoleOutputType } from "../types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface ConsolePanelProps {
  outputs: any[];
  expandedPaths: Set<string>;
  selectedOutput: string | null;
  filter: ConsoleOutputType | "all";
  isOpen: boolean;
  executingCode: boolean;
  onClear: () => void;
  onToggleExpand: (path: string) => void;
  onSetFilter: (filter: ConsoleOutputType | "all") => void;
  onToggleConsole: () => void;
  onSelectOutput: (id: string | null) => void;
  onExpandAll: (id: string) => void;
  onCollapseAll: (id: string) => void;
  className?: string;
}

export function ConsolePanel({
  outputs,
  expandedPaths,
  selectedOutput,
  filter,
  isOpen,
  executingCode,
  onClear,
  onToggleExpand,
  onSetFilter,
  onToggleConsole,
  onSelectOutput,
  onExpandAll,
  onCollapseAll,
  className,
}: ConsolePanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Desplazarse hacia abajo cuando se añaden nuevos mensajes
  useEffect(() => {
    if (containerRef.current && isOpen) {
      containerRef.current.scrollTop = 0; // Scroll to top (messages are in reverse order)
    }
  }, [outputs.length, isOpen]);

  // Contar tipos de mensajes
  const counts = {
    all: outputs.length,
    error: outputs.filter((o) => o.type === "error").length,
    warn: outputs.filter((o) => o.type === "warn").length,
    info: outputs.filter((o) => o.type === "info").length,
    log: outputs.filter((o) => o.type === "log").length,
    debug: outputs.filter((o) => o.type === "debug").length,
  };

  // Funciones para filtros
  const handleFilter = (newFilter: ConsoleOutputType | "all") => {
    onSetFilter(newFilter);
  };

  // Componentes de filtro
  const FilterButton = ({
    type,
    icon,
    label,
  }: {
    type: ConsoleOutputType | "all";
    icon: React.ReactNode;
    label: string;
  }) => {
    const count = counts[type];
    const isActive = filter === type;

    return (
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "flex items-center gap-1 text-xs rounded-sm px-2 py-1 h-6",
          isActive ? "bg-gray-700" : "hover:bg-gray-800"
        )}
        onClick={() => handleFilter(type)}
        title={label}
        disabled={count === 0}
      >
        {icon}
        <span className={count === 0 ? "text-gray-600" : undefined}>
          {count}
        </span>
      </Button>
    );
  };

  return (
    <div
      className={cn(
        "flex flex-col bg-gray-900 border-t border-gray-700",
        className,
        isOpen ? "h-64" : "h-9"
      )}
    >
      {/* Console header */}
      <div className="flex items-center justify-between px-3 py-1 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-6 w-6"
            onClick={onToggleConsole}
          >
            {isOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </Button>

          <h3 className="text-sm font-medium text-gray-200">Console</h3>

          {executingCode && (
            <div className="ml-2 flex items-center">
              <div className="animate-pulse w-2 h-2 rounded-full bg-green-500 mr-1"></div>
              <span className="text-xs text-gray-400">Running...</span>
            </div>
          )}
        </div>

        {isOpen && (
          <div className="flex items-center gap-1">
            {/* Filter toggles */}
            <div className="flex items-center gap-0.5 mr-2 bg-gray-900 rounded-sm p-0.5">
              <FilterButton
                type="all"
                icon={<Filter className="w-3 h-3" />}
                label="All messages"
              />
              <FilterButton
                type="error"
                icon={<AlertCircle className="w-3 h-3 text-red-500" />}
                label="Errors"
              />
              <FilterButton
                type="warn"
                icon={<AlertTriangle className="w-3 h-3 text-yellow-500" />}
                label="Warnings"
              />
              <FilterButton
                type="info"
                icon={<Info className="w-3 h-3 text-blue-500" />}
                label="Info"
              />
              <FilterButton
                type="log"
                icon={<MessageCircle className="w-3 h-3 text-gray-400" />}
                label="Logs"
              />
              <FilterButton
                type="debug"
                icon={<Bug className="w-3 h-3 text-purple-400" />}
                label="Debug"
              />
            </div>

            {/* Clear button */}
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-6 w-6 text-gray-400 hover:text-gray-200"
              onClick={onClear}
              title="Clear console"
            >
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Console content */}
      {isOpen && (
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden"
        >
          {outputs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              Console is empty
            </div>
          ) : (
            <div className="flex flex-col-reverse">
              {" "}
              {/* Reverse order, newest first */}
              {outputs.map((output) => (
                <ConsoleOutput
                  key={output.id}
                  output={output}
                  expandedPaths={expandedPaths}
                  onToggleExpand={onToggleExpand}
                  isSelected={output.id === selectedOutput}
                  onSelect={onSelectOutput}
                  onExpandAll={onExpandAll}
                  onCollapseAll={onCollapseAll}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
