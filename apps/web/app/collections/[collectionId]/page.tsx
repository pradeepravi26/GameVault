"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { AuthUser, CollectionDetail } from "@gamevault/contracts";
import { ArrowLeft, Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  deleteCollectionById,
  getCollectionById,
  getCurrentUser,
  likeCollectionById,
  removeGameFromCollection,
  renameCollection,
} from "@/lib/api";

export default function CollectionDetailPage() {
  const params = useParams<{ collectionId: string }>();
  const router = useRouter();
  const collectionId = Number(params.collectionId);
  const hasValidCollectionId = Number.isInteger(collectionId) && collectionId > 0;
  const [collection, setCollection] = useState<CollectionDetail | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [collectionName, setCollectionName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!hasValidCollectionId) {
      return;
    }

    let cancelled = false;

    async function loadCollection() {
      setIsLoading(true);
      setError(null);

      try {
        const [collectionResponse, authResponse] = await Promise.all([
          getCollectionById(collectionId),
          getCurrentUser().catch(() => null),
        ]);

        if (!cancelled) {
          setCollection(collectionResponse);
          setCollectionName(collectionResponse.collectionName);
          setCurrentUser(authResponse?.user ?? null);
        }
      } catch (caughtError) {
        if (!cancelled) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Unable to load collection.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadCollection();

    return () => {
      cancelled = true;
    };
  }, [collectionId, hasValidCollectionId]);

  const isOwner = currentUser?.userId === collection?.userId;

  async function refreshCollection() {
    const response = await getCollectionById(collectionId);
    setCollection(response);
    setCollectionName(response.collectionName);
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-12">
      <Button asChild variant="ghost" className="w-fit">
        <Link href="/collections">
          <ArrowLeft className="h-4 w-4" />
          Back to Collections
        </Link>
      </Button>

      {!hasValidCollectionId ? (
        <div className="rounded-lg border border-destructive/30 p-4 text-sm text-destructive">
          Invalid collection id.
        </div>
      ) : isLoading ? (
        <div className="space-y-4">
          <div className="h-10 w-64 rounded-md bg-muted" />
          <div className="h-32 rounded-lg border bg-muted" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/30 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : collection ? (
        <div className="space-y-8">
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Collection Detail
            </p>
            <h1 className="text-4xl font-semibold tracking-tight">
              {collection.collectionName}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <Link
                href={`/users/${collection.userId}`}
                className="underline-offset-4 hover:text-foreground hover:underline"
              >
                by {collection.username}
              </Link>
              <span>{collection.gameCount} games</span>
              <span>{collection.likeCount} likes</span>
            </div>
          </div>

          <div className="space-y-4 rounded-lg border p-6">
            {isOwner ? (
              <>
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold">Manage collection</h2>
                  <p className="text-sm text-muted-foreground">
                    Rename this collection or delete it entirely.
                  </p>
                </div>

                <form
                  className="flex flex-col gap-3 sm:flex-row"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    setError(null);
                    setIsSubmitting(true);

                    try {
                      await renameCollection(collection.collectionId, {
                        collectionName,
                      });
                      await refreshCollection();
                    } catch (caughtError) {
                      setError(
                        caughtError instanceof Error
                          ? caughtError.message
                          : "Unable to rename collection.",
                      );
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                >
                  <Input
                    value={collectionName}
                    onChange={(event) => setCollectionName(event.target.value)}
                    className="sm:max-w-sm"
                  />
                  <Button type="submit" disabled={isSubmitting}>
                    Save Name
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    onClick={async () => {
                      setError(null);
                      setIsSubmitting(true);

                      try {
                        await deleteCollectionById(collection.collectionId);
                        router.push("/collections");
                        router.refresh();
                      } catch (caughtError) {
                        setError(
                          caughtError instanceof Error
                            ? caughtError.message
                            : "Unable to delete collection.",
                        );
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Collection
                  </Button>
                </form>
              </>
            ) : (
              <>
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold">Support this collection</h2>
                  <p className="text-sm text-muted-foreground">
                    If you like this collection, add your like to it.
                  </p>
                </div>

                <Button
                  variant={collection.likedByCurrentUser ? "default" : "outline"}
                  disabled={!currentUser}
                  onClick={async () => {
                    setError(null);

                    try {
                      await likeCollectionById(collection.collectionId);
                      await refreshCollection();
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
                  {collection.likedByCurrentUser ? "Liked" : "Like Collection"}
                </Button>
              </>
            )}
          </div>

          <section className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Games</h2>
              <p className="text-sm text-muted-foreground">
                Titles currently included in this collection.
              </p>
            </div>

            {collection.games.length === 0 ? (
              <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                This collection does not have any games yet.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {collection.games.map((game) => (
                  <article
                    key={game.gameId}
                    className="space-y-4 overflow-hidden rounded-lg border"
                  >
                    <Link href={`/games/${game.gameId}`} className="block">
                      {game.imageUrl ? (
                        <img
                          src={game.imageUrl}
                          alt=""
                          className="h-40 w-full object-cover"
                        />
                      ) : (
                        <div className="h-40 w-full bg-muted" />
                      )}
                    </Link>
                    <div className="space-y-3 px-4 pb-4">
                      <div className="space-y-2">
                        <Link
                          href={`/games/${game.gameId}`}
                          className="font-semibold underline-offset-4 hover:underline"
                        >
                          {game.title}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {game.firstReleaseDate ?? "Release date unavailable"}
                        </p>
                      </div>

                      {isOwner ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                          setError(null);

                          try {
                            await removeGameFromCollection(
                              collection.collectionId,
                              game.gameId,
                            );
                            await refreshCollection();
                          } catch (caughtError) {
                            setError(
                              caughtError instanceof Error
                                ? caughtError.message
                                : "Unable to remove game from collection.",
                            );
                          }
                        }}
                      >
                          Remove Game
                        </Button>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </section>
  );
}
