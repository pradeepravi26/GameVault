"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type {
  AuthUser,
  CollectionSummary,
  GameDetail,
  GameReview,
} from "@gamevault/contracts";
import { ArrowLeft, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addGameToCollection,
  deleteReview,
  getCollectionsForUser,
  getCurrentUser,
  getGameById,
  getMyReviewForGame,
  getReviewsForGame,
  upsertReviewForGame,
} from "@/lib/api";

export default function GameDetailPage() {
  const params = useParams<{ gameId: string }>();
  const gameId = Number(params.gameId);
  const hasValidGameId = Number.isInteger(gameId) && gameId > 0;
  const [game, setGame] = useState<GameDetail | null>(null);
  const [reviews, setReviews] = useState<GameReview[]>([]);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [collections, setCollections] = useState<CollectionSummary[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState("");
  const [myReview, setMyReview] = useState<GameReview | null>(null);
  const [score, setScore] = useState("8");
  const [reviewBody, setReviewBody] = useState("");
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isAddingToCollection, setIsAddingToCollection] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [collectionError, setCollectionError] = useState<string | null>(null);
  const [collectionMessage, setCollectionMessage] = useState<string | null>(null);
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
        const [gameResponse, reviewsResponse, authResponse] = await Promise.all([
          getGameById(gameId),
          getReviewsForGame(gameId),
          getCurrentUser().catch(() => null),
        ]);

        if (!cancelled) {
          setGame(gameResponse);
          setReviews(reviewsResponse.reviews);
          setCurrentUser(authResponse?.user ?? null);
        }

        if (authResponse?.user) {
          const [myReviewResponse, collectionsResponse] = await Promise.all([
            getMyReviewForGame(gameId),
            getCollectionsForUser(authResponse.user.userId),
          ]);

          if (!cancelled) {
            setMyReview(myReviewResponse.review);
            setScore(String(myReviewResponse.review?.score ?? 8));
            setReviewBody(myReviewResponse.review?.reviewBody ?? "");
            setIsSpoiler(myReviewResponse.review?.isSpoiler ?? false);
            setCollections(collectionsResponse.collections);
            setSelectedCollectionId(
              collectionsResponse.collections[0]
                ? String(collectionsResponse.collections[0].collectionId)
                : "",
            );
          }
        } else if (!cancelled) {
          setMyReview(null);
          setScore("8");
          setReviewBody("");
          setIsSpoiler(false);
          setCollections([]);
          setSelectedCollectionId("");
        }
      } catch (caughtError) {
        if (!cancelled) {
          setGame(null);
          setReviews([]);
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

  async function refreshReviews() {
    const [reviewsResponse, myReviewResponse] = await Promise.all([
      getReviewsForGame(gameId),
      currentUser ? getMyReviewForGame(gameId) : Promise.resolve({ review: null }),
    ]);

    setReviews(reviewsResponse.reviews);
    setMyReview(myReviewResponse.review);
    setScore(String(myReviewResponse.review?.score ?? 8));
    setReviewBody(myReviewResponse.review?.reviewBody ?? "");
    setIsSpoiler(myReviewResponse.review?.isSpoiler ?? false);

    const latestGame = await getGameById(gameId);
    setGame(latestGame);
  }

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
            <div className="grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
              <div className="h-[420px] rounded-lg border bg-muted" />
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

            <div className="grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
              <div className="overflow-hidden rounded-lg border bg-card">
                {game.imageUrl ? (
                  <img
                    src={game.imageUrl}
                    alt={game.title}
                    className="h-[420px] w-full object-cover"
                  />
                ) : (
                  <div className="h-[420px] bg-muted" />
                )}
              </div>

              <div className="space-y-6 rounded-lg border p-6 md:max-w-md">
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

                <div className="space-y-3 rounded-md border p-4">
                  <div className="space-y-1">
                    <h2 className="text-sm font-medium text-muted-foreground">
                      Add to collection
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Save this game to one of your collections.
                    </p>
                  </div>

                  {currentUser ? (
                    collections.length > 0 ? (
                      <>
                        <Select
                          value={selectedCollectionId}
                          onValueChange={setSelectedCollectionId}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Choose a collection" />
                          </SelectTrigger>
                          <SelectContent>
                            {collections.map((collection) => (
                              <SelectItem
                                key={collection.collectionId}
                                value={String(collection.collectionId)}
                              >
                                {collection.collectionName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Button
                          variant="outline"
                          disabled={!selectedCollectionId || isAddingToCollection}
                          onClick={async () => {
                            setCollectionError(null);
                            setCollectionMessage(null);
                            setIsAddingToCollection(true);

                            try {
                              await addGameToCollection(Number(selectedCollectionId), {
                                gameId,
                              });
                              setCollectionMessage("Game added to collection.");
                            } catch (caughtError) {
                              setCollectionError(
                                caughtError instanceof Error
                                  ? caughtError.message
                                  : "Unable to add game to collection.",
                              );
                            } finally {
                              setIsAddingToCollection(false);
                            }
                          }}
                        >
                          {isAddingToCollection
                            ? "Adding..."
                            : "Add to Collection"}
                        </Button>
                      </>
                    ) : (
                      <div className="rounded-md border p-3 text-sm text-muted-foreground">
                        You do not have any collections yet.{" "}
                        <Link
                          href="/collections"
                          className="underline underline-offset-4"
                        >
                          Create one first
                        </Link>
                        .
                      </div>
                    )
                  ) : (
                    <div className="rounded-md border p-3 text-sm text-muted-foreground">
                      <Link href="/login" className="underline underline-offset-4">
                        Login
                      </Link>{" "}
                      to add this game to one of your collections.
                    </div>
                  )}

                  {collectionError ? (
                    <div className="rounded-md border border-destructive/30 p-3 text-sm text-destructive">
                      {collectionError}
                    </div>
                  ) : null}

                  {collectionMessage ? (
                    <div className="rounded-md border p-3 text-sm">
                      {collectionMessage}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <section className="space-y-4 rounded-lg border p-6">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold">Your Review</h2>
                  <p className="text-sm text-muted-foreground">
                    {currentUser
                      ? "Add a score and optional written review."
                      : "Log in to write a review for this game."}
                  </p>
                </div>

                {currentUser ? (
                  <form
                    className="space-y-4"
                    onSubmit={async (event) => {
                      event.preventDefault();
                      setReviewError(null);
                      setIsSubmittingReview(true);

                      try {
                        await upsertReviewForGame(gameId, {
                          score: Number(score),
                          reviewBody,
                          isSpoiler,
                        });
                        await refreshReviews();
                      } catch (caughtError) {
                        setReviewError(
                          caughtError instanceof Error
                            ? caughtError.message
                            : "Unable to save review.",
                        );
                      } finally {
                        setIsSubmittingReview(false);
                      }
                    }}
                  >
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Score</label>
                      <Select value={score} onValueChange={setScore}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose a score" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 10 }, (_, index) => {
                            const value = String(index + 1);
                            return (
                              <SelectItem key={value} value={value}>
                                {value} / 10
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="review-body">
                        Review
                      </label>
                      <textarea
                        id="review-body"
                        value={reviewBody}
                        onChange={(event) => setReviewBody(event.target.value)}
                        rows={6}
                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                        placeholder="Share what you liked or disliked about the game."
                      />
                    </div>

                    <label className="flex items-center gap-2 text-sm">
                      <Input
                        type="checkbox"
                        checked={isSpoiler}
                        onChange={(event) => setIsSpoiler(event.target.checked)}
                        className="h-4 w-4"
                      />
                      Mark review as spoiler
                    </label>

                    {reviewError ? (
                      <div className="rounded-md border border-destructive/30 p-3 text-sm text-destructive">
                        {reviewError}
                      </div>
                    ) : null}

                    <div className="flex flex-wrap gap-3">
                      <Button type="submit" disabled={isSubmittingReview}>
                        {isSubmittingReview
                          ? "Saving..."
                          : myReview
                            ? "Update Review"
                            : "Submit Review"}
                      </Button>
                      {myReview ? (
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isSubmittingReview}
                          onClick={async () => {
                            setReviewError(null);
                            setIsSubmittingReview(true);

                            try {
                              await deleteReview(myReview.ratingId);
                              await refreshReviews();
                            } catch (caughtError) {
                              setReviewError(
                                caughtError instanceof Error
                                  ? caughtError.message
                                  : "Unable to delete review.",
                              );
                            } finally {
                              setIsSubmittingReview(false);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Review
                        </Button>
                      ) : null}
                    </div>
                  </form>
                ) : (
                  <div className="rounded-md border p-4 text-sm text-muted-foreground">
                    <Link href="/login" className="underline underline-offset-4">
                      Login
                    </Link>{" "}
                    to write a review.
                  </div>
                )}
              </section>

              <section className="space-y-4 rounded-lg border p-6">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold">Community Reviews</h2>
                  <p className="text-sm text-muted-foreground">
                    Recent ratings and impressions from players.
                  </p>
                </div>

                {reviews.length === 0 ? (
                  <div className="rounded-md border p-4 text-sm text-muted-foreground">
                    No reviews yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <article
                        key={review.ratingId}
                        className="space-y-3 rounded-md border p-4"
                      >
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="font-medium">{review.username}</span>
                          <span className="text-muted-foreground">
                            rated {review.score?.toFixed(1) ?? "N/A"} / 10
                          </span>
                          {review.isSpoiler ? (
                            <span className="rounded-md border px-2 py-0.5 text-xs">
                              Spoiler
                            </span>
                          ) : null}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {review.postedAt}
                        </p>
                        <p
                          className={
                            review.isSpoiler
                              ? "text-sm break-words whitespace-pre-wrap blur-sm transition hover:blur-none"
                              : "text-sm break-words whitespace-pre-wrap"
                          }
                        >
                          {review.reviewBody?.trim()
                            ? review.reviewBody
                            : "No written review provided."}
                        </p>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
