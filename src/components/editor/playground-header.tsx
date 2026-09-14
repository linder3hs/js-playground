"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Braces, FileText, SquareCode } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/**
 * Chrome shared by every playground: a 44px row, zinc bottom border, the
 * brand on the left and the orange accent only on hover. Each playground
 * drops in its own controls; the frame is never written twice.
 */

export const iconButton =
  "inline-flex h-7 w-7 items-center justify-center rounded text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-100";

export const textButton =
  "inline-flex h-7 items-center gap-1.5 rounded border border-zinc-200 px-2.5 text-[11px] font-medium text-zinc-500 transition-colors hover:border-orange-500/60 hover:text-orange-500 disabled:opacity-40 dark:border-zinc-800";

const PLAYGROUNDS = [
  { href: "/playground/js-ts", label: "JS/TS", icon: SquareCode },
  { href: "/playground/markdown", label: "Markdown", icon: FileText },
  { href: "/playground/json", label: "JSON", icon: Braces },
];

/**
 * Jumping between playgrounds used to mean going back to the landing page.
 * The segmented control sits where each screen used to print its own static
 * label, so it costs no extra room and names the current screen anyway.
 *
 * Labels collapse to icons below `sm`: three of them plus the JS/TS language
 * switch do not fit on a phone.
 */
function PlaygroundSwitcher() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Playgrounds"
      className="flex gap-0.5 rounded-md border border-zinc-200 p-0.5 dark:border-zinc-800"
    >
      {PLAYGROUNDS.map(({ href, label, icon: Icon }) => {
        const current = pathname === href;

        return (
          <Link
            key={href}
            href={href}
            aria-current={current ? "page" : undefined}
            title={label}
            className={cn(
              "flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-medium transition-colors",
              current
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden sm:inline">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

interface PlaygroundHeaderProps {
  /** Controls sitting next to the switcher (language switch, …) */
  left?: ReactNode;
  /** Controls on the far right */
  children?: ReactNode;
}

export function PlaygroundHeader({ left, children }: PlaygroundHeaderProps) {
  return (
    <header className="flex h-11 shrink-0 items-center justify-between gap-4 border-b border-zinc-200 px-3 dark:border-zinc-800">
      <div className="flex items-center gap-3">
        <Link href="/" aria-label="js/playground home" className="hidden md:block">
          <Logo />
        </Link>

        <PlaygroundSwitcher />
        {left}
      </div>

      <div className="flex items-center gap-3">{children}</div>
    </header>
  );
}
