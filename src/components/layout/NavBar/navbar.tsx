import { Github } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const navLinks = [
  { name: "JS / TS", href: "/playground/js-ts" },
  { name: "Markdown", href: "/playground/markdown" },
  { name: "JSON", href: "/playground/json" },
];

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-[#0A0A0B]/80">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="font-medium tracking-tight">
          js<span className="text-orange-500">/</span>playground
        </Link>

        {/* ponytail: no mobile menu — the playground grid below is the mobile nav */}
        <div className="hidden items-center gap-6 text-sm text-zinc-600 dark:text-zinc-400 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <a
            href="https://github.com/linder3hs/js-playground"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub repository"
            className="rounded-md p-2 text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <Github className="h-4 w-4" />
          </a>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
