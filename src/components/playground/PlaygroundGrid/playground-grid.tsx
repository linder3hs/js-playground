import { PlaygroundCard, type PlaygroundCardProps } from "../PlaygroundCard";

const playgrounds: PlaygroundCardProps[] = [
  {
    title: "JavaScript / TypeScript",
    description:
      "ES6+ and full type checking, with a console that runs as you type.",
    link: "/playground/js-ts",
  },
  {
    title: "Markdown Editor",
    description: "Write Markdown, see it rendered side by side.",
    link: "/playground/markdown",
  },
  {
    title: "JSON Formatter",
    description: "Format, validate and explore JSON in a tree view.",
    link: "/playground/json",
  },
  {
    title: "React Editor",
    description: "JSX, components and hooks with a live preview.",
    link: "/playground/react",
    comingSoon: true,
  },
  {
    title: "Swift Playground",
    description: "Run Swift snippets for iOS and macOS.",
    link: "/playground/swift",
    comingSoon: true,
  },
];

export function PlaygroundGrid() {
  return (
    <section className="mx-auto max-w-5xl px-6 pb-24">
      <h2 className="mb-6 text-sm font-medium uppercase tracking-wider text-zinc-500">
        Playgrounds
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {playgrounds.map((playground) => (
          <PlaygroundCard key={playground.title} {...playground} />
        ))}
      </div>
    </section>
  );
}
