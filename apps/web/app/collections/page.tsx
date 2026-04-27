"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { AuthUser, CollectionSummary } from "@gamevault/contracts";
import { ChevronLeft, ChevronRight, Heart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createCollection,
  getCollections,
  getCollectionsForUser,
  getCurrentUser,
  likeCollectionById,
} from "@/lib/api";

const allCollectionsPageSize = 9;

export default function CollectionsPage() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [allCollections, setAllCollections] = useState<CollectionSummary[]>([]);
  const [myCollections, setMyCollections] = useState<CollectionSummary[]>([]);
  const [allCollectionsPage, setAllCollectionsPage] = useState(1);
  const [allCollectionsPageInput, setAllCollectionsPageInput] = useState("1");
  const [collectionName, setCollectionName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalAllCollectionsPages = useMemo(
    () => Math.max(1, Math.ceil(allCollections.length / allCollectionsPageSize)),
    [allCollections.length],
  );

  const pagedAllCollections = useMemo(() => {
    const startIndex = (allCollectionsPage - 1) * allCollectionsPageSize;
    return allCollections.slice(startIndex, startIndex + allCollectionsPageSize);
  }, [allCollections, allCollectionsPage]);

  useEffect(() => {
    setAllCollectionsPage((currentPage) =>
      Math.max(1, Math.min(currentPage, totalAllCollectionsPages)),
    );
  }, [totalAllCollectionsPages]);

  useEffect(() => {
    setAllCollectionsPageInput(String(allCollectionsPage));
  }, [allCollectionsPage]);

  async function refreshCollections(userOverride?: AuthUser | null) {
    const resolvedUser = userOverride ?? currentUser;
    const [allResponse, myResponse] = await Promise.all([
      getCollections(),
      resolvedUser
        ? getCollectionsForUser(resolvedUser.userId)
        : Promise.resolve({ collections: [] }),
    ]);

    setAllCollections(allResponse.collections);
    setMyCollections(myResponse.collections);
  }

  function commitAllCollectionsPageInput() {
    if (!/^\d+$/.test(allCollectionsPageInput)) {
      setAllCollectionsPageInput(String(allCollectionsPage));
      return;
    }

    const parsedPage = Number(allCollectionsPageInput);
    const nextPage = Math.min(totalAllCollectionsPages, Math.max(1, parsedPage));
    setAllCollectionsPage(nextPage);
    setAllCollectionsPageInput(String(nextPage));
  }

  useEffect(() => {
    let cancelled = false;

    async function loadPage() {
      setIsLoading(true);
      setError(null);

      try {
        const authResponse = await getCurrentUser().catch(() => null);
        const resolvedUser = authResponse?.user ?? null;

        if (!cancelled) {
          setCurrentUser(resolvedUser);
        }

        const [allResponse, myResponse] = await Promise.all([
          getCollections(),
          resolvedUser
            ? getCollectionsForUser(resolvedUser.userId)
            : Promise.resolve({ collections: [] }),
        ]);

        if (!cancelled) {
          setAllCollections(allResponse.collections);
          setMyCollections(myResponse.collections);
        }
      } catch (caughtError) {
        if (!cancelled) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Unable to load collections.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadPage();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-16">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Collections
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Browse collections
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          Explore collections, create your own, and keep track of games you want
          to revisit.
        </p>
      </div>

      {currentUser ? (
        <section className="space-y-4 rounded-lg border p-6">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Create a collection</h2>
            <p className="text-sm text-muted-foreground">
              Collections help you organize favorites, backlog picks, or any
              themed list you want to keep.
            </p>
          </div>

          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={async (event) => {
              event.preventDefault();

              if (!collectionName.trim()) {
                return;
              }

              setError(null);
              setIsSubmitting(true);

              try {
                await createCollection({ collectionName });
                setCollectionName("");
                await refreshCollections();
              } catch (caughtError) {
                setError(
                  caughtError instanceof Error
                    ? caughtError.message
                    : "Unable to create collection.",
                );
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            <Input
              value={collectionName}
              onChange={(event) => setCollectionName(event.target.value)}
              placeholder="Collection name"
              className="sm:max-w-sm"
            />
            <Button type="submit" disabled={isSubmitting}>
              <Plus className="h-4 w-4" />
              {isSubmitting ? "Creating..." : "Create Collection"}
            </Button>
          </form>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              Your collections
            </h3>
            {myCollections.length === 0 ? (
              <div className="rounded-md border p-4 text-sm text-muted-foreground">
                You have not created any collections yet.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {myCollections.map((collection) => (
                  <Link
                    key={collection.collectionId}
                    href={`/collections/${collection.collectionId}`}
                    className="rounded-lg border p-4 transition hover:bg-accent/30"
                  >
                    <div className="space-y-2">
                      <h4 className="font-semibold">{collection.collectionName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {collection.gameCount} games
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      ) : (
        <div className="rounded-lg border p-4 text-sm text-muted-foreground">
          <Link href="/login" className="underline underline-offset-4">
            Login
          </Link>{" "}
          to create and manage your own collections.
        </div>
      )}

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">All collections</h2>
          <p className="text-sm text-muted-foreground">
            Browse collections created by users in the app.
          </p>
        </div>

        <div className="flex min-h-[28rem] flex-col">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-36 rounded-lg border bg-muted" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive/30 p-4 text-sm text-destructive">
              {error}
            </div>
          ) : allCollections.length === 0 ? (
            <div className="rounded-lg border p-4 text-sm text-muted-foreground">
              No collections yet.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {pagedAllCollections.map((collection) => (
                <article
                  key={collection.collectionId}
                  className="space-y-4 rounded-lg border p-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <Link
                        href={`/collections/${collection.collectionId}`}
                        className="font-semibold underline-offset-4 hover:underline"
                      >
                        {collection.collectionName}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        by {collection.username}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{collection.gameCount} games</span>
                      <span>{collection.likeCount} likes</span>
                    </div>
                  </div>

                  <Button
                    variant={collection.likedByCurrentUser ? "default" : "outline"}
                    size="sm"
                    className={
                      collection.likedByCurrentUser
                        ? "border-rose-500 bg-rose-500 text-white hover:bg-rose-500/90"
                        : undefined
                    }
                    disabled={!currentUser}
                    onClick={async () => {
                      setError(null);

                      try {
                        await likeCollectionById(collection.collectionId);
                        await refreshCollections();
                      } catch (caughtError) {
                        setError(
                          caughtError instanceof Error
                            ? caughtError.message
                            : "Unable to like collection.",
                        );
                      }
                    }}
                  >
                    <Heart
                      className={
                        collection.likedByCurrentUser
                          ? "h-4 w-4 fill-current"
                          : "h-4 w-4"
                      }
                    />
                    {collection.likedByCurrentUser ? "Liked" : "Like"}
                  </Button>
                </article>
              ))}
            </div>
          )}

          {allCollections.length > 0 && !isLoading && !error ? (
            <div className="mt-auto flex flex-wrap items-center justify-center border-t pt-4">
              <form
                className="inline-flex items-center gap-1 rounded-md px-1"
                onSubmit={(event) => {
                  event.preventDefault();
                  commitAllCollectionsPageInput();
                }}
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={allCollectionsPage === 1}
                  aria-label="Previous page"
                  onClick={() => {
                    setAllCollectionsPage((currentPage) =>
                      Math.max(1, currentPage - 1),
                    );
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <Input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="h-7 w-12 px-1 text-center text-sm"
                  value={allCollectionsPageInput}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    if (nextValue === "" || /^\d+$/.test(nextValue)) {
                      setAllCollectionsPageInput(nextValue);
                    }
                  }}
                  onBlur={commitAllCollectionsPageInput}
                  aria-label="Current page"
                />
                <span className="px-1 text-sm text-muted-foreground">
                  of {totalAllCollectionsPages}
                </span>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={allCollectionsPage >= totalAllCollectionsPages}
                  aria-label="Next page"
                  onClick={() => {
                    setAllCollectionsPage((currentPage) =>
                      Math.min(totalAllCollectionsPages, currentPage + 1),
                    );
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </form>
            </div>
          ) : null}
        </div>
      </section>
    </section>
  );
}
