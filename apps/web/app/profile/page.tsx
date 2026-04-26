"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type {
  AuthUser,
  CollectionSummary,
  UserProfile,
  UserReview,
} from "@gamevault/contracts";
import { Button } from "@/components/ui/button";
import {
  getCollectionsForUser,
  getCurrentUser,
  getReviewsByUser,
  getUserProfile,
} from "@/lib/api";

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [collections, setCollections] = useState<CollectionSummary[]>([]);
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setIsLoading(true);
      setError(null);

      try {
        const authResponse = await getCurrentUser();
        const user = authResponse.user;

        if (!cancelled) {
          setCurrentUser(user);
        }

        const [profileResponse, collectionsResponse, reviewsResponse] =
          await Promise.all([
            getUserProfile(user.userId),
            getCollectionsForUser(user.userId),
            getReviewsByUser(user.userId),
          ]);

        if (!cancelled) {
          setProfile(profileResponse);
          setCollections(collectionsResponse.collections);
          setReviews(reviewsResponse.reviews);
        }
      } catch (caughtError) {
        if (!cancelled) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Unable to load profile.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  const totalLikesReceived = useMemo(
    () => collections.reduce((sum, collection) => sum + collection.likeCount, 0),
    [collections],
  );

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-16">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Profile
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">Your Profile</h1>
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
        <div className="space-y-4 rounded-lg border border-destructive/30 p-6">
          <p className="text-sm text-destructive">{error}</p>
          {!currentUser ? (
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          ) : null}
        </div>
      ) : profile ? (
        <div className="space-y-8">
          <section className="rounded-lg border p-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">{profile.username}</h2>
              <p className="text-sm text-muted-foreground">
                {profile.firstName || profile.lastName
                  ? [profile.firstName, profile.lastName]
                      .filter(Boolean)
                      .join(" ")
                  : "No display name set"}
              </p>
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
              <p className="text-sm text-muted-foreground">Collection Likes</p>
              <p className="mt-2 text-3xl font-semibold">{totalLikesReceived}</p>
            </article>
          </section>

          <section className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold">Your Collections</h2>
              <p className="text-sm text-muted-foreground">
                Collections you have created and can manage.
              </p>
            </div>

            {collections.length === 0 ? (
              <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                You have not created any collections yet.
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
              <h2 className="text-2xl font-semibold">Recent Reviews</h2>
              <p className="text-sm text-muted-foreground">
                Ratings and writeups you have posted so far.
              </p>
            </div>

            {reviews.length === 0 ? (
              <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                You have not written any reviews yet.
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
                    <p className="text-xs text-muted-foreground">
                      {review.postedAt}
                    </p>
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
