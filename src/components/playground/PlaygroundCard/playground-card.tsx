import { ExternalLink } from "lucide-react";
import Link from "next/link";

interface PlaygroundCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  comingSoon?: boolean;
  link?: string;
}

export function PlaygroundCard({
  title,
  description,
  icon,
  gradient,
  comingSoon,
  link,
}: PlaygroundCardProps) {
  return (
    <Link
      target="_blank"
      href={comingSoon ? "/#" : (link as string)}
      className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${gradient} border border-gray-800 p-6 hover:border-gray-700 transition-all duration-300`}
    >
      {comingSoon && (
        <div className="absolute top-3 right-3 px-3 py-1 bg-gray-800/80 rounded-full text-xs font-medium text-gray-400">
          Coming Soon
        </div>
      )}
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      <p className="text-gray-400 mb-4">{description}</p>
      <button
        className={`flex items-center gap-2 text-sm font-medium ${
          comingSoon
            ? "text-gray-500 cursor-not-allowed"
            : "text-orange-500 hover:text-orange-400"
        }`}
        disabled={comingSoon}
      >
        Open Playground
        <ExternalLink className="w-4 h-4" />
      </button>
    </Link>
  );
}
