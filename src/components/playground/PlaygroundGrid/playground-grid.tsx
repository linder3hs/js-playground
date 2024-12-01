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
      title: "Swift",
      icon: <Code2 className="w-6 h-6 text-orange-400" />,
      description:
        "Write and test Swift code with iOS and macOS frameworks support.",
      gradient: "from-orange-500/20 to-red-500/20",
      comingSoon: true,
      link: "/playground/js-ts",
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
