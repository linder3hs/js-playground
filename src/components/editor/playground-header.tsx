"use client";

import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Chrome común a todos los playgrounds: fila de 44px, borde inferior zinc,
 * marca a la izquierda y acento naranja sólo en hover. Cada playground mete
 * sus propios controles; el marco no se vuelve a escribir.
 */

export const iconButton =
  "inline-flex h-7 w-7 items-center justify-center rounded text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-100";

export const textButton =
  "inline-flex h-7 items-center gap-1.5 rounded border border-zinc-200 px-2.5 text-[11px] font-medium text-zinc-500 transition-colors hover:border-orange-500/60 hover:text-orange-500 disabled:opacity-40 dark:border-zinc-800";

interface PlaygroundHeaderProps {
  /** Controles pegados a la marca (selector de lenguaje, etiqueta, …) */
  left?: ReactNode;
  /** Controles del extremo derecho */
  children?: ReactNode;
}

export function PlaygroundHeader({ left, children }: PlaygroundHeaderProps) {
  return (
    <header className="flex h-11 shrink-0 items-center justify-between gap-4 border-b border-zinc-200 px-3 dark:border-zinc-800">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="text-sm font-medium tracking-tight text-zinc-900 dark:text-zinc-100"
        >
          js<span className="text-orange-500">/</span>playground
        </Link>
        {left}
      </div>

      <div className="flex items-center gap-3">{children}</div>
    </header>
  );
}
