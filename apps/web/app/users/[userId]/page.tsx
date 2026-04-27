"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type {
  AuthUser,
  CollectionSummary,
  UserProfile,
  UserReview,
} from "@gamevault/contracts";
import {
  getCollectionsForUser,
  getCurrentUser,
  getReviewsByUser,
  getUserProfile,
} from "@/lib/api";

export default function PublicUserProfilePage() {
  const params = useParams<{ userId: string }>();
  const userId = Number(params.userId);
  const validId = Number.isInteger(userId) && userId > 0;

  const [viewer, setViewer] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [collections, setCollections] = useState<CollectionSummary[]>([]);
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!validId) {
      return;
    }

    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const authResponse = await getCurrentUser().catch(() => null);
        if (!cancelled) {
          setViewer(authResponse?.user ?? null);
        }

        const [profileResponse, collectionsResponse, reviewsResponse] = await Promise.all([
          getUserProfile(userId),
          getCollectionsForUser(userId),
          getReviewsByUser(userId),
        ]);

        if (!cancelled) {
          setProfile(profileResponse);
          setCollections(collectionsResponse.collections);
          setReviews(reviewsResponse.reviews);
        }
      } catch (caughtError) {
        if (!cancelled) {
          setError(
            caughtError instanceof Error ? caughtError.message : "Unable to load profile.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [userId, validId]);

  const totalLikesReceived = useMemo(
    () => collections.reduce((sum, collection) => sum + collection.likeCount, 0),
    [collections],
  );

  const displayName =
    profile?.firstName || profile?.lastName
      ? [profile.firstName, profile.lastName].filter(Boolean).join(" ")
      : null;

  if (!validId) {
    return (
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-16">
        <div className="rounded-lg border border-destructive/30 p-4 text-sm text-destructive">
          Invalid user id.
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-16">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Member
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">Profile</h1>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="h-32 rounded-lg border bg-muted" />
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-28 rounded-lg border bg-muted" />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/30 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : profile ? (
        <div className="space-y-8">
          <section className="rounded-lg border p-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">{profile.username}</h2>
              <p className="text-sm text-muted-foreground">
                {displayName ?? "No display name set"}
              </p>
              {viewer?.userId === profile.userId ? (
                <p className="text-sm text-muted-foreground">
                  This is your account.{" "}
                  <Link href="/profile" className="underline underline-offset-4">
                    Open account overview
                  </Link>
                </p>
              ) : null}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <article className="rounded-lg border p-5">
              <p className="text-sm text-muted-foreground">Collections</p>
              <p className="mt-2 text-3xl font-semibold">{collections.length}</p>
            </article>
            <article className="rounded-lg border p-5">
              <p className="text-sm text-muted-foreground">Reviews</p>
              <p className="mt-2 text-3xl font-semibold">{reviews.length}</p>
            </article>
            <article className="rounded-lg border p-5">
              <p className="text-sm text-muted-foreground">Collection likes</p>
              <p className="mt-2 text-3xl font-semibold">{totalLikesReceived}</p>
            </article>
          </section>

          <section className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold">Collections</h2>
              <p className="text-sm text-muted-foreground">
                Public lists created by this member.
              </p>
            </div>

            {collections.length === 0 ? (
              <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                No collections yet.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {collections.map((collection) => (
                  <Link
                    key={collection.collectionId}
                    href={`/collections/${collection.collectionId}`}
                    className="rounded-lg border p-4 transition hover:bg-accent/30"
                  >
                    <div className="space-y-2">
                      <h3 className="font-semibold">{collection.collectionName}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span>{collection.gameCount} games</span>
                        <span>{collection.likeCount} likes</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold">Reviews</h2>
              <p className="text-sm text-muted-foreground">
                Ratings and notes they have shared.
              </p>
            </div>

            {reviews.length === 0 ? (
              <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                No reviews yet.
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <article
                    key={review.ratingId}
                    className="space-y-3 rounded-lg border p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/games/${review.gameId}`}
                        className="font-semibold underline-offset-4 hover:underline"
                      >
                        {review.gameTitle}
                      </Link>
                      <span className="text-sm text-muted-foreground">
                        {review.score?.toFixed(1) ?? "N/A"} / 10
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{review.postedAt}</p>
                    <p className="text-sm">
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
      ) : null}
    </section>
  );
}
