import { Terminal, Command, Code2 } from "lucide-react";
import { PlaygroundCard } from "../PlaygroundCard";

export function PlaygroundGrid() {
  const playgrounds = [
    {
      title: "JavaScript",
      icon: <Terminal className="w-6 h-6 text-yellow-400" />,
      description:
        "Modern JavaScript development environment with full ES6+ support.",
      gradient: "from-yellow-500/20 to-orange-500/20",
      link: "/playground/js-ts",
    },
    {
      title: "TypeScript",
      icon: <Command className="w-6 h-6 text-blue-400" />,
      description:
        "TypeScript playground with full type checking and IntelliSense.",
      gradient: "from-blue-500/20 to-purple-500/20",
      link: "/playground/js-ts",
    },
    {
      title: "Web Editor",
      icon: <Code2 className="w-6 h-6 text-purple-400" />,
      description:
        "Live HTML, CSS, and JavaScript editor with real-time preview.",
      gradient: "from-purple-500/20 to-pink-500/20",
      link: "/playground/web",
    },
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {playgrounds.map((playground, index) => (
        <PlaygroundCard key={index} {...playground} />
      ))}
    </div>
  );
}
