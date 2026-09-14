import { cn } from "@/lib/utils";

/**
 * The mark is the slash from the wordmark, cut out of an orange tile: the one
 * shape the brand already had. It stays legible at 16px, where the earlier
 * ideas (brackets, a play triangle, a caret block) turned to mush.
 *
 * Keep it in sync with `src/app/icon.svg`, which is the same geometry.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden
      className={cn("shrink-0", className)}
    >
      <defs>
        <linearGradient id="logo-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FB923C" />
          <stop offset="1" stopColor="#EA580C" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#logo-mark)" />
      <path d="M19.2 4.8h5.2L12.8 27.2H7.6z" fill="#0A0A0B" />
    </svg>
  );
}

/**
 * Full lockup. The tile stands in for the slash in "js/playground", so the
 * mark and the name are the same idea instead of two.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex items-center gap-1.5 text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100",
        className
      )}
    >
      js
      <LogoMark className="h-4 w-4" />
      playground
      <span className="sr-only">js/playground</span>
    </span>
  );
}
