"use client";

import { ConsoleOutput as ConsoleOutputType } from "../types";
import { ConsoleValueViewer } from "../ConsoleValueViewer";
import { AlertCircle, AlertTriangle, Bug, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConsoleOutputProps {
  output: ConsoleOutputType;
  isSelected: boolean;
  onSelect: (id: string | null) => void;
}

/**
 * A console entry.
 *
 * The level is stated once: it used to arrive as a colored border, an icon and
 * the word "log"/"warn"/"error", with three buttons of its own alongside. Here
 * the icon carries the color, and the timestamp only shows on hover.
 */

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return `${date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })}.${date.getMilliseconds().toString().padStart(3, "0")}`;
};

function LevelIcon({ type }: { type: ConsoleOutputType["type"] }) {
  switch (type) {
    case "error":
      return <AlertCircle className="h-3.5 w-3.5 text-red-500" aria-hidden />;
    case "warn":
      return (
        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" aria-hidden />
      );
    case "info":
      return <Info className="h-3.5 w-3.5 text-sky-500" aria-hidden />;
    case "debug":
      return <Bug className="h-3.5 w-3.5 text-violet-500" aria-hidden />;
    default:
      // A log needs no icon: the value already carries its own chevron to
      // expand, and two arrows in a row read like a render bug.
      return (
        <span className="block h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
      );
  }
}

export function ConsoleOutput({
  output,
  isSelected,
  onSelect,
}: ConsoleOutputProps) {
  const isError = output.type === "error";

  return (
    <div
      onClick={() => onSelect(isSelected ? null : output.id)}
      className={cn(
        "group flex gap-2 border-b px-3 py-1.5 text-[13px]",
        "border-zinc-100 dark:border-zinc-900",
        isError && "bg-red-50/60 dark:bg-red-950/20",
        output.type === "warn" && "bg-amber-50/60 dark:bg-amber-950/20"
      )}
    >
      {/* Fixed height = first line's height, so any icon centers on it */}
      <span className="flex h-[21px] shrink-0 items-center">
        <LevelIcon type={output.type} />
      </span>

      <div className="min-w-0 flex-1 overflow-x-auto">
        {/* Several arguments print separated by a space, the same as in
            cualquier consola: console.log("total", 42) -> total 42 */}
        {output.values.map((value, index) => (
          <span key={`${output.id}-${index}`}>
            {index > 0 && " "}
            <ConsoleValueViewer value={value} />
          </span>
        ))}

        {isError && output.stack && isSelected && (
          <pre className="mt-1.5 whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-zinc-500">
            {output.stack}
          </pre>
        )}
      </div>

      <time
        dateTime={new Date(output.timestamp).toISOString()}
        className="shrink-0 font-mono text-[10px] tabular-nums text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100 dark:text-zinc-600"
      >
        {formatTime(output.timestamp)}
      </time>
    </div>
  );
}
