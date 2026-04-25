import type { GameListItem } from "@gamevault/contracts";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function GameCard({
  game,
  className,
}: {
  game: GameListItem;
  className?: string;
}) {
  return (
    <article
      className={cn("overflow-hidden rounded-lg border bg-card text-card-foreground", className)}
    >
      {game.imageUrl ? (
        <img
          src={game.imageUrl}
          alt={game.title}
          className="h-56 w-full object-cover"
        />
      ) : (
        <div className="h-56 bg-muted" />
      )}
      <div className="space-y-3 p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Star className="h-4 w-4" />
          <span>{game.averageScore?.toFixed(1) ?? "N/A"}</span>
        </div>
        <div className="space-y-1">
          <h3 className="line-clamp-2 text-base font-semibold leading-6">
            {game.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {game.firstReleaseDate ?? "Release date unavailable"}
          </p>
        </div>
      </div>
    </article>
  );
}
