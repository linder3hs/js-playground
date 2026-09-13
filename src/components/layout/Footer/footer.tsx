export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800/80">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-6 py-6 text-sm text-zinc-500">
        <span>MIT licensed. Free forever.</span>
        <div className="flex items-center gap-5">
          <a
            href="https://github.com/linder3hs/js-playground"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            GitHub
          </a>
          <a
            href="https://github.com/linder3hs"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            @linder3hs
          </a>
        </div>
      </div>
    </footer>
  );
}
