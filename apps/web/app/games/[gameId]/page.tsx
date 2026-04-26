"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { GameDetail } from "@gamevault/contracts";
import { ArrowLeft, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getGameById } from "@/lib/api";

export default function GameDetailPage() {
  const params = useParams<{ gameId: string }>();
  const gameId = Number(params.gameId);
  const hasValidGameId = Number.isInteger(gameId) && gameId > 0;
  const [game, setGame] = useState<GameDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasValidGameId) {
      return;
    }

    let cancelled = false;

    async function loadGame() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getGameById(gameId);

        if (!cancelled) {
          setGame(response);
        }
      } catch (caughtError) {
        if (!cancelled) {
          setGame(null);
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Unable to load game details.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadGame();

    return () => {
      cancelled = true;
    };
  }, [gameId, hasValidGameId]);

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
      <div>
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/catalog">
            <ArrowLeft className="h-4 w-4" />
            Back to Catalog
          </Link>
        </Button>

        {!hasValidGameId ? (
          <div className="rounded-lg border border-destructive/30 p-4 text-sm text-destructive">
            Invalid game id.
          </div>
        ) : isLoading ? (
          <div className="space-y-6">
            <div className="h-10 w-64 rounded-md bg-muted" />
            <div className="grid gap-6 md:grid-cols-[280px_1fr]">
              <div className="h-[360px] rounded-lg border bg-muted" />
              <div className="space-y-4">
                <div className="h-5 w-40 rounded-md bg-muted" />
                <div className="h-5 w-56 rounded-md bg-muted" />
                <div className="h-24 rounded-md bg-muted" />
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-destructive/30 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : game ? (
          <div className="space-y-8">
            <div className="space-y-3">
              <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Game Detail
              </p>
              <h1 className="text-4xl font-semibold tracking-tight">
                {game.title}
              </h1>
            </div>

            <div className="grid gap-6 md:grid-cols-[280px_1fr]">
              <div className="overflow-hidden rounded-lg border bg-card">
                {game.imageUrl ? (
                  <img
                    src={game.imageUrl}
                    alt={game.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-[360px] bg-muted" />
                )}
              </div>

              <div className="space-y-6 rounded-lg border p-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="h-4 w-4" />
                  <span>
                    {game.averageScore?.toFixed(1) ?? "N/A"} average score
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{game.ratingCount} ratings</span>
                </div>

                <div className="space-y-3">
                  <h2 className="text-sm font-medium text-muted-foreground">
                    Genres
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {game.genres.length > 0 ? (
                      game.genres.map((genre) => (
                        <span
                          key={genre}
                          className="rounded-md border px-3 py-1 text-sm"
                        >
                          {genre}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        No genres available.
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-sm font-medium text-muted-foreground">
                    Platforms
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {game.platforms.length > 0 ? (
                      game.platforms.map((platform) => (
                        <span
                          key={platform}
                          className="rounded-md border px-3 py-1 text-sm"
                        >
                          {platform}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        No platforms available.
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button disabled>Add Review</Button>
                  <Button variant="outline" disabled>
                    Add to Collection
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
