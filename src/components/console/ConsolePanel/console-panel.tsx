"use client";

import { AlertCircle, AlertTriangle, Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { ConsoleOutput } from "../ConsoleOutput";
import { ConsoleOutput as IConsoleOutput, ConsoleOutputType } from "../types";
import { cn } from "@/lib/utils";

interface ConsolePanelProps {
  /** Already filtered: this is what gets painted */
  outputs: IConsoleOutput[];
  /** Unfiltered: the counters must stay visible while a filter is on */
  allOutputs: IConsoleOutput[];
  selectedOutput: string | null;
  filter: ConsoleOutputType | "all";
  executingCode: boolean;
  autoRun: boolean;
  onClear: () => void;
  onSetFilter: (filter: ConsoleOutputType | "all") => void;
  onSelectOutput: (id: string | null) => void;
  className?: string;
}

/**
 * Error and warning counters. They are the only filter: the other levels did
 * not justify a chip permanently sitting at zero.
 */
function CountChip({
  count,
  active,
  label,
  icon,
  onClick,
}: {
  count: number;
  active: boolean;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={active ? `Show everything` : `Show only ${label}`}
      className={cn(
        "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] tabular-nums transition-colors",
        active
          ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
          : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      )}
    >
      {icon}
      {count}
    </button>
  );
}

export function ConsolePanel({
  outputs,
  allOutputs,
  selectedOutput,
  filter,
  executingCode,
  autoRun,
  onClear,
  onSetFilter,
  onSelectOutput,
  className,
}: ConsolePanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // New entries go at the bottom, like any console, and the view follows.
  useEffect(() => {
    const container = containerRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [outputs.length]);

  const errors = allOutputs.filter((o) => o.type === "error").length;
  const warnings = allOutputs.filter((o) => o.type === "warn").length;

  const toggleFilter = (type: ConsoleOutputType) =>
    onSetFilter(filter === type ? "all" : type);

  // Oldest to newest: `outputs` arrives the other way around.
  const ordered = [...outputs].reverse();

  return (
    <div className={cn("flex flex-col bg-white dark:bg-[#0A0A0B]", className)}>
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-zinc-200 px-3 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
            Console
          </span>

          {executingCode && (
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-500" />
          )}

          {(errors > 0 || filter === "error") && (
            <CountChip
              count={errors}
              active={filter === "error"}
              label="errors"
              icon={<AlertCircle className="h-3 w-3 text-red-500" />}
              onClick={() => toggleFilter("error")}
            />
          )}

          {(warnings > 0 || filter === "warn") && (
            <CountChip
              count={warnings}
              active={filter === "warn"}
              label="warnings"
              icon={<AlertTriangle className="h-3 w-3 text-amber-500" />}
              onClick={() => toggleFilter("warn")}
            />
          )}
        </div>

        {allOutputs.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            title="Clear console"
            className="inline-flex h-6 w-6 items-center justify-center rounded text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
            <span className="sr-only">Clear console</span>
          </button>
        )}
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto">
        {ordered.length === 0 ? (
          <p className="px-3 py-3 text-xs text-zinc-500">
            {allOutputs.length > 0
              ? `Nothing matches this filter.`
              : autoRun
                ? "Output appears as you type."
                : "Press Run to see output."}
          </p>
        ) : (
          ordered.map((output) => (
            <ConsoleOutput
              key={output.id}
              output={output}
              isSelected={output.id === selectedOutput}
              onSelect={onSelectOutput}
            />
          ))
        )}
      </div>
    </div>
  );
}
