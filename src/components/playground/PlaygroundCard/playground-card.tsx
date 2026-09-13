import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export interface PlaygroundCardProps {
  title: string;
  description: string;
  link: string;
  comingSoon?: boolean;
}

export function PlaygroundCard({
  title,
  description,
  link,
  comingSoon,
}: PlaygroundCardProps) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-medium">{title}</h3>
        {comingSoon ? (
          <span className="shrink-0 text-xs text-zinc-400 dark:text-zinc-600">
            Soon
          </span>
        ) : (
          <ArrowUpRight className="h-4 w-4 shrink-0 text-zinc-400 transition-colors group-hover:text-orange-500" />
        )}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {description}
      </p>
    </>
  );

  const base =
    "rounded-lg border border-zinc-200 p-5 dark:border-zinc-800/80";

  if (comingSoon) {
    return <div className={`${base} opacity-50`}>{body}</div>;
  }

  return (
    <Link
      href={link}
      className={`${base} group block transition-colors hover:border-orange-500/60`}
    >
      {body}
    </Link>
  );
}
