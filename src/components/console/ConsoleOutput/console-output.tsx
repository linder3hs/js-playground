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
 * Una entrada de consola.
 *
 * El tipo se comunica una sola vez: antes venía como borde de color, ícono y
 * además la palabra "log"/"warn"/"error", con tres botones propios al lado.
 * Acá el ícono lleva el color, y la hora sólo aparece al pasar el mouse.
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
      // Un log no necesita ícono: el valor ya trae su propio chevron para
      // expandir, y dos flechas seguidas se leían como un error de render.
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
      {/* Altura fija = alto de la primera línea, para centrar cualquier ícono */}
      <span className="flex h-[21px] shrink-0 items-center">
        <LevelIcon type={output.type} />
      </span>

      <div className="min-w-0 flex-1 overflow-x-auto">
        {/* Varios argumentos se imprimen separados por un espacio, como en
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
