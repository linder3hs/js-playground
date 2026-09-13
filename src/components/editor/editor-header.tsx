"use client";

import Link from "next/link";
import { Columns2, Play, Rows2, Share2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { PlaygroundLanguage } from "@/store/editor-store";
import type { LayoutOrientation } from "@/lib/types";

/**
 * Barra única del playground. Reemplaza al `shared/EditorToolbar` genérico en
 * esta pantalla: el compartido no tiene control segmentado ni deja mostrar el
 * atajo, y doblarlo costaba más que estas líneas. Los otros playgrounds siguen
 * usando el compartido.
 *
 * Sigue el mismo lenguaje que el mock del editor en el landing: fila de 44px,
 * borde inferior zinc, acento naranja sólo en hover.
 */

interface EditorHeaderProps {
  language: PlaygroundLanguage;
  onLanguageChange: (language: PlaygroundLanguage) => void;
  autoRun: boolean;
  onAutoRunChange: (autoRun: boolean) => void;
  onRun: () => void;
  isRunning: boolean;
  onShare: () => void;
  orientation: LayoutOrientation;
  onToggleOrientation: () => void;
}

const LANGUAGES: { value: PlaygroundLanguage; label: string }[] = [
  { value: "javascript", label: "JS" },
  { value: "typescript", label: "TS" },
];

const iconButton =
  "inline-flex h-7 w-7 items-center justify-center rounded text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-100";

export function EditorHeader({
  language,
  onLanguageChange,
  autoRun,
  onAutoRunChange,
  onRun,
  isRunning,
  onShare,
  orientation,
  onToggleOrientation,
}: EditorHeaderProps) {
  return (
    <header className="flex h-11 shrink-0 items-center justify-between gap-4 border-b border-zinc-200 px-3 dark:border-zinc-800">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="text-sm font-medium tracking-tight text-zinc-900 dark:text-zinc-100"
        >
          js<span className="text-orange-500">/</span>playground
        </Link>

        <div
          role="radiogroup"
          aria-label="Language"
          className="flex gap-0.5 rounded-md border border-zinc-200 p-0.5 dark:border-zinc-800"
        >
          {LANGUAGES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={language === value}
              onClick={() => onLanguageChange(value)}
              className={cn(
                "rounded px-2.5 py-0.5 text-xs font-medium transition-colors",
                language === value
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <Switch
            checked={autoRun}
            onCheckedChange={onAutoRunChange}
            aria-label="Run as you type"
          />
          Run as you type
        </label>

        <button
          type="button"
          onClick={onRun}
          disabled={isRunning}
          title="Run now (Ctrl/⌘ + Enter)"
          className="inline-flex h-7 items-center gap-1.5 rounded border border-zinc-200 px-2.5 text-[11px] font-medium text-zinc-500 transition-colors hover:border-orange-500/60 hover:text-orange-500 disabled:opacity-40 dark:border-zinc-800"
        >
          <Play className="h-3 w-3" aria-hidden />
          Run
        </button>

        <div className="flex items-center">
          <button
            type="button"
            onClick={onShare}
            title="Copy a link to this code"
            className={iconButton}
          >
            <Share2 className="h-4 w-4" aria-hidden />
            <span className="sr-only">Copy a link to this code</span>
          </button>

          <button
            type="button"
            onClick={onToggleOrientation}
            title={
              orientation === "horizontal"
                ? "Stack editor and console"
                : "Place console beside the editor"
            }
            className={iconButton}
          >
            {orientation === "horizontal" ? (
              <Rows2 className="h-4 w-4" aria-hidden />
            ) : (
              <Columns2 className="h-4 w-4" aria-hidden />
            )}
            <span className="sr-only">Switch layout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
