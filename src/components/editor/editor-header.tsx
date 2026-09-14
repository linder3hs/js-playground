"use client";

import { Columns2, Play, Rows2, Share2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  PlaygroundHeader,
  iconButton,
  textButton,
} from "./playground-header";
import type { PlaygroundLanguage } from "@/store/editor-store";
import type { LayoutOrientation } from "@/lib/types";

/**
 * Barra del playground JS/TS. El marco (marca, altura, bordes) vive en
 * `PlaygroundHeader`, compartido con los demás playgrounds; aquí sólo van los
 * controles propios: lenguaje, auto-run y ejecutar.
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
    <PlaygroundHeader
      left={
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
      }
    >
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
        className={textButton}
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
    </PlaygroundHeader>
  );
}
