import type { CSSProperties, ReactNode } from "react";
import { Play } from "lucide-react";
import Link from "next/link";

/** Per-line animation delay, in seconds. */
const at = (t: number) => ({ "--t": `${t}s` }) as CSSProperties;

const K = ({ children }: { children: ReactNode }) => (
  <span className="text-violet-600 dark:text-violet-400">{children}</span>
);
const S = ({ children }: { children: ReactNode }) => (
  <span className="text-emerald-600 dark:text-emerald-400">{children}</span>
);
const F = ({ children }: { children: ReactNode }) => (
  <span className="text-sky-600 dark:text-sky-400">{children}</span>
);
const P = ({ children }: { children: ReactNode }) => (
  <span className="text-zinc-400 dark:text-zinc-500">{children}</span>
);

const OUTPUT = ["JS / TS", "Web", "Markdown", "JSON"];

// Code types out first, then the console answers.
const CODE_STEP = 0.18;
const CODE_START = 0.3;
const LOG_START = CODE_START + 8 * CODE_STEP + 0.3;

export function HeroSection() {
  return (
    <section className="px-6 pt-28 pb-20 md:pt-36 md:pb-24">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-[max(36px,min(6vw,60px))] font-semibold leading-[1.05] tracking-[-0.035em]">
          Write JavaScript.
          <br />
          Install nothing.
        </h1>

        <p className="mx-auto mt-6 max-w-lg text-balance text-[17px] leading-[1.7] text-zinc-500 dark:text-zinc-400">
          A Monaco editor that runs in your browser. No account, no setup,
          nothing to install.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/playground/js-ts"
            className="inline-flex h-11 cursor-pointer items-center rounded-md bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Start coding
          </Link>
          <a
            href="https://github.com/linder3hs/js-playground"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 cursor-pointer items-center rounded-md border border-zinc-300 px-6 text-sm font-medium transition-colors hover:border-zinc-500 dark:border-zinc-700 dark:hover:border-zinc-500"
          >
            View source
          </a>
        </div>
      </div>

      <Link
        href="/playground/js-ts"
        aria-label="Open the JavaScript playground"
        className="group mx-auto mt-16 block max-w-4xl cursor-pointer overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50/60 shadow-sm transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:border-zinc-700"
      >
        <div className="flex h-11 items-center justify-between border-b border-zinc-200 px-4 dark:border-zinc-800">
          <span className="font-mono text-xs text-zinc-500">playground.js</span>
          <span className="inline-flex items-center gap-1.5 rounded border border-zinc-200 px-2 py-1 text-[11px] font-medium text-zinc-500 transition-colors group-hover:border-zinc-400 group-hover:text-zinc-700 dark:border-zinc-800 dark:text-zinc-500 dark:group-hover:border-zinc-600 dark:group-hover:text-zinc-300">
            <Play className="h-3 w-3" aria-hidden />
            Run
          </span>
        </div>

        <div className="grid divide-y divide-zinc-200 dark:divide-zinc-800 md:grid-cols-[1.15fr_0.85fr] md:divide-x md:divide-y-0">
          {/* min-w-0: without it the longest code line sets the grid track
              width and the whole page scrolls sideways on mobile. */}
          <pre className="min-w-0 overflow-x-auto p-5 font-mono text-[13px] leading-[1.75] text-zinc-700 dark:text-zinc-300">
            <code>
              <span className="type-line" style={at(CODE_START)}>
                <K>const</K> playgrounds <P>= [</P>
              </span>
              <span
                className="type-line"
                style={at(CODE_START + CODE_STEP)}
              >
                {"  "}
                <S>&quot;JS / TS&quot;</S>
                <P>,</P> <S>&quot;Web&quot;</S>
                <P>,</P>
              </span>
              <span
                className="type-line"
                style={at(CODE_START + CODE_STEP * 2)}
              >
                {"  "}
                <S>&quot;Markdown&quot;</S>
                <P>,</P> <S>&quot;JSON&quot;</S>
                <P>,</P>
              </span>
              <span
                className="type-line"
                style={at(CODE_START + CODE_STEP * 3)}
              >
                <P>];</P>
              </span>
              <span
                className="type-line"
                style={at(CODE_START + CODE_STEP * 4)}
              >
                {" "}
              </span>
              <span
                className="type-line"
                style={at(CODE_START + CODE_STEP * 5)}
              >
                <K>for</K> <P>(</P>
                <K>const</K> name <K>of</K> playgrounds<P>) {"{"}</P>
              </span>
              <span
                className="type-line"
                style={at(CODE_START + CODE_STEP * 6)}
              >
                {"  "}
                console<P>.</P>
                <F>log</F>
                <P>(</P>
                <S>{"`▸ ${name}`"}</S>
                <P>);</P>
              </span>
              <span
                className="type-line"
                style={at(CODE_START + CODE_STEP * 7)}
              >
                <P>{"}"}</P>
                <span className="caret" style={at(CODE_START + CODE_STEP * 8)} />
              </span>
            </code>
          </pre>

          <div className="min-w-0 p-5 font-mono text-[13px] leading-[1.75]">
            <div className="mb-3 text-[10px] uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-600">
              Console
            </div>
            {OUTPUT.map((line, i) => (
              <div
                key={line}
                className="log-line text-zinc-700 dark:text-zinc-300"
                style={at(LOG_START + i * 0.14)}
              >
                <span className="text-orange-500">▸</span> {line}
              </div>
            ))}
          </div>
        </div>
      </Link>
    </section>
  );
}
