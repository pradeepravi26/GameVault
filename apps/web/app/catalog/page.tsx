"use client";

import { useEffect, useMemo, useState } from "react";
import type { GameListItem, Genre, Platform } from "@gamevault/contracts";
import { Check, Search, X } from "lucide-react";
import { GameCard } from "@/components/game-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getGames, getGenres, getPlatforms } from "@/lib/api";

const pageSize = 12;

const sortOptions = [
  { label: "Title A-Z", sort: "title", direction: "asc" },
  { label: "Title Z-A", sort: "title", direction: "desc" },
  { label: "Newest", sort: "releaseDate", direction: "desc" },
  { label: "Oldest", sort: "releaseDate", direction: "asc" },
  { label: "Top Rated", sort: "averageScore", direction: "desc" },
] as const;

export default function CatalogPage() {
  const [games, setGames] = useState<GameListItem[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [sort, setSort] = useState("title");
  const [direction, setDirection] = useState("asc");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadFilters() {
      try {
        const [genreRows, platformRows] = await Promise.all([
          getGenres(),
          getPlatforms(),
        ]);

        if (!cancelled) {
          setGenres(genreRows);
          setPlatforms(platformRows);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load catalog filters.");
        }
      }
    }

    loadFilters();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadGames() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getGames({
          page,
          pageSize,
          search: activeSearch,
          genre: selectedGenre,
          platform: selectedPlatform,
          sort,
          direction,
        });

        if (!cancelled) {
          setGames(response.items);
          setTotal(response.total);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load catalog games.");
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
  }, [activeSearch, direction, page, selectedGenre, selectedPlatform, sort]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total],
  );

  const activeSortLabel =
    sortOptions.find(
      (option) => option.sort === sort && option.direction === direction,
    )?.label ?? "Custom";

  function resetFilters() {
    setSearchInput("");
    setActiveSearch("");
    setSelectedGenre("");
    setSelectedPlatform("");
    setSort("title");
    setDirection("asc");
    setPage(1);
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-16">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Catalog
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">Browse the game library</h1>
      </div>

      <div className="rounded-lg border p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>{total} games found</span>
            <span>Current sort: {activeSortLabel}</span>
          </div>

          <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1.6fr)_minmax(180px,0.8fr)_minmax(180px,0.8fr)_auto_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by title"
                className="h-10 pl-9"
              />
            </div>

            <Select
              value={selectedGenre || "__all_genres__"}
              onValueChange={(value) => {
                setSelectedGenre(value === "__all_genres__" ? "" : value);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="All genres" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all_genres__">
                  All genres
                </SelectItem>
                {genres.map((genre) => (
                  <SelectItem key={genre.genreId} value={genre.genreName}>
                    {genre.genreName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedPlatform || "__all_platforms__"}
              onValueChange={(value) => {
                setSelectedPlatform(value === "__all_platforms__" ? "" : value);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="All platforms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all_platforms__">
                  All platforms
                </SelectItem>
                {platforms.map((platform) => (
                  <SelectItem key={platform.platformId} value={platform.platformName}>
                    {platform.platformName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              className="h-10 px-4"
              onClick={() => {
                setPage(1);
                setActiveSearch(searchInput.trim());
              }}
            >
              Search
            </Button>

            <Button
              variant="outline"
              className="h-10 px-4"
              onClick={resetFilters}
            >
              <X className="h-4 w-4" />
              Reset
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-sm text-muted-foreground">Sort by</span>
            {sortOptions.map((option) => {
              const isActive =
                option.sort === sort && option.direction === direction;

              return (
                <Button
                  key={`${option.sort}-${option.direction}`}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  aria-pressed={isActive}
                  onClick={() => {
                    setSort(option.sort);
                    setDirection(option.direction);
                    setPage(1);
                  }}
                >
                  {isActive ? <Check className="h-4 w-4" /> : null}
                  {option.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Showing page {page}</span>
        <span>
          Page {page} of {totalPages}
        </span>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: pageSize }).map((_, index) => (
            <div
              key={`catalog-loading-${index}`}
              className="h-[21rem] rounded-lg border bg-muted"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/30 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {games.map((game) => (
            <GameCard key={game.gameId} game={game} />
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage((current) => Math.max(1, current - 1))}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          disabled={page >= totalPages}
          onClick={() =>
            setPage((current) => Math.min(totalPages, current + 1))
          }
        >
          Next
        </Button>
      </div>
    </section>
  );
}
