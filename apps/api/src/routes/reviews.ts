import { Hono } from "hono";
import {
  addOrUpdateReview,
  deleteReviewById,
  getReviewsForGame,
  getUserReviewForGame,
} from "@gamevault/db";
import {
  deleteReviewResponseSchema,
  gameReviewsResponseSchema,
  myGameReviewResponseSchema,
  upsertGameReviewRequestSchema,
} from "@gamevault/contracts";
import { getRequestUser } from "../lib/auth";

export const reviewsRoute = new Hono();

reviewsRoute.get("/games/:gameId/reviews", async (c) => {
  const gameId = Number(c.req.param("gameId"));

  if (!Number.isInteger(gameId) || gameId <= 0) {
    return c.json({ error: "Invalid gameId" }, 400);
  }

  const reviews = await getReviewsForGame(gameId);
  return c.json(gameReviewsResponseSchema.parse({ reviews }), 200);
});

reviewsRoute.get("/games/:gameId/my-review", async (c) => {
  const gameId = Number(c.req.param("gameId"));

  if (!Number.isInteger(gameId) || gameId <= 0) {
    return c.json({ error: "Invalid gameId" }, 400);
  }

  const user = await getRequestUser(c);

  if (!user) {
    return c.json({ error: "Not authenticated." }, 401);
  }

  const review = await getUserReviewForGame(user.userId, gameId);
  return c.json(myGameReviewResponseSchema.parse({ review }), 200);
});

reviewsRoute.post("/games/:gameId/reviews", async (c) => {
  const gameId = Number(c.req.param("gameId"));

  if (!Number.isInteger(gameId) || gameId <= 0) {
    return c.json({ error: "Invalid gameId" }, 400);
  }

  const user = await getRequestUser(c);

  if (!user) {
    return c.json({ error: "Not authenticated." }, 401);
  }

  const body = await c.req.json();
  const input = upsertGameReviewRequestSchema.parse(body);

  const review = await addOrUpdateReview({
    userId: user.userId,
    gameId,
    score: input.score,
    reviewBody: input.reviewBody,
    isSpoiler: input.isSpoiler,
  });

  return c.json(myGameReviewResponseSchema.parse({ review }), 200);
});

reviewsRoute.delete("/reviews/:ratingId", async (c) => {
  const ratingId = Number(c.req.param("ratingId"));

  if (!Number.isInteger(ratingId) || ratingId <= 0) {
    return c.json({ error: "Invalid ratingId" }, 400);
  }

  const user = await getRequestUser(c);

  if (!user) {
    return c.json({ error: "Not authenticated." }, 401);
  }

  const deleted = await deleteReviewById({
    ratingId,
    userId: user.userId,
  });

  if (!deleted) {
    return c.json({ error: "Review not found." }, 404);
  }

  return c.json(deleteReviewResponseSchema.parse({ ok: true }), 200);
});
