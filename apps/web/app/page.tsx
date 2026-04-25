"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { GameListItem } from "@gamevault/contracts";
import { GameCard } from "@/components/game-card";
import { Button } from "@/components/ui/button";
import { getGames } from "@/lib/api";

export default function Home() {
  const [games, setGames] = useState<GameListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadGames() {
      try {
        const response = await getGames({
          page: 1,
          pageSize: 6,
          sort: "releaseDate",
        });

        if (!cancelled) {
          setGames(response.items);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load games from the backend right now.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadGames();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="pb-16">
      <section className="mx-auto w-full max-w-7xl px-6 py-12 md:py-16">
        <div className="max-w-3xl space-y-4">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Home
          </p>
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Browse the game library.
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            GameVault helps you explore titles, keep track of favorites, and
            dive into the catalog.
          </p>
          <Button asChild>
            <Link href="/catalog">
              View More in Catalog
            </Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">Featured Games</h2>
          <Link
            href="/catalog"
            className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            View all
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`loading-${index}`}
                className="h-84 rounded-lg border bg-muted"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-lg border border-destructive/30 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {games.map((game) => (
              <GameCard key={game.gameId} game={game} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
