import type { ResultSetHeader, RowDataPacket } from "mysql2";
import {
  gameReviewSchema,
  gameReviewsResponseSchema,
  myGameReviewResponseSchema,
  userReviewsResponseSchema,
  type GameReview,
} from "@gamevault/contracts";
import { dbPool } from "../client/pool";

interface ReviewRow extends RowDataPacket {
  ratingId: number;
  postedAt: string;
  userId: number;
  username: string;
  score: string | number | null;
  reviewBody: string | null;
  isSpoiler: number | boolean | null;
}

interface UserReviewRow extends ReviewRow {
  gameId: number;
  gameTitle: string;
}

function normalizeReview(row: ReviewRow) {
  return gameReviewSchema.parse({
    ratingId: row.ratingId,
    postedAt: row.postedAt,
    userId: row.userId,
    username: row.username,
    score: row.score === null ? null : Number(row.score),
    reviewBody: row.reviewBody,
    isSpoiler: Boolean(row.isSpoiler),
  } satisfies GameReview);
}

export async function getReviewsForGame(gameId: number) {
  const [rows] = await dbPool.query<ReviewRow[]>(
    `
      SELECT
        r.rating_id AS ratingId,
        DATE_FORMAT(r.posted_at, '%Y-%m-%d %H:%i:%s') AS postedAt,
        u.user_id AS userId,
        u.username,
        ns.score,
        rt.review_body AS reviewBody,
        rt.is_spoiler AS isSpoiler
      FROM ratings AS r
      JOIN users AS u
        ON r.user_id = u.user_id
      LEFT JOIN numeric_scores AS ns
        ON r.rating_id = ns.rating_id
      LEFT JOIN review_texts AS rt
        ON r.rating_id = rt.rating_id
      WHERE r.game_id = ?
      ORDER BY r.posted_at DESC, r.rating_id DESC
    `,
    [gameId],
  );

  return gameReviewsResponseSchema.parse({
    reviews: rows.map(normalizeReview),
  }).reviews;
}

export async function getUserReviewForGame(userId: number, gameId: number) {
  const [rows] = await dbPool.query<ReviewRow[]>(
    `
      SELECT
        r.rating_id AS ratingId,
        DATE_FORMAT(r.posted_at, '%Y-%m-%d %H:%i:%s') AS postedAt,
        u.user_id AS userId,
        u.username,
        ns.score,
        rt.review_body AS reviewBody,
        rt.is_spoiler AS isSpoiler
      FROM ratings AS r
      JOIN users AS u
        ON r.user_id = u.user_id
      LEFT JOIN numeric_scores AS ns
        ON r.rating_id = ns.rating_id
      LEFT JOIN review_texts AS rt
        ON r.rating_id = rt.rating_id
      WHERE r.user_id = ?
        AND r.game_id = ?
      LIMIT 1
    `,
    [userId, gameId],
  );

  const row = rows[0];

  return myGameReviewResponseSchema.parse({
    review: row ? normalizeReview(row) : null,
  }).review;
}

export async function addOrUpdateReview(input: {
  userId: number;
  gameId: number;
  score: number;
  reviewBody?: string;
  isSpoiler: boolean;
}) {
  await dbPool.query(
    `
      CALL add_or_update_rating(?, ?, ?, ?, ?)
    `,
    [
      input.userId,
      input.gameId,
      input.score,
      input.reviewBody?.trim() ? input.reviewBody.trim() : null,
      input.isSpoiler,
    ],
  );

  return getUserReviewForGame(input.userId, input.gameId);
}

export async function deleteReviewById(input: { ratingId: number; userId: number }) {
  const [result] = await dbPool.execute<ResultSetHeader>(
    `
      DELETE FROM ratings
      WHERE rating_id = ?
        AND user_id = ?
    `,
    [input.ratingId, input.userId],
  );

  return result.affectedRows > 0;
}

export async function getReviewsByUser(userId: number) {
  const [rows] = await dbPool.query<UserReviewRow[]>(
    `
      SELECT
        r.rating_id AS ratingId,
        DATE_FORMAT(r.posted_at, '%Y-%m-%d %H:%i:%s') AS postedAt,
        u.user_id AS userId,
        u.username,
        g.game_id AS gameId,
        g.title AS gameTitle,
        ns.score,
        rt.review_body AS reviewBody,
        rt.is_spoiler AS isSpoiler
      FROM ratings AS r
      JOIN users AS u
        ON r.user_id = u.user_id
      JOIN games AS g
        ON r.game_id = g.game_id
      LEFT JOIN numeric_scores AS ns
        ON r.rating_id = ns.rating_id
      LEFT JOIN review_texts AS rt
        ON r.rating_id = rt.rating_id
      WHERE r.user_id = ?
      ORDER BY r.posted_at DESC, r.rating_id DESC
    `,
    [userId],
  );

  return userReviewsResponseSchema.parse({
    reviews: rows.map((row) => ({
      ...gameReviewSchema.parse({
        ratingId: row.ratingId,
        postedAt: row.postedAt,
        userId: row.userId,
        username: row.username,
        score: row.score === null ? null : Number(row.score),
        reviewBody: row.reviewBody,
        isSpoiler: Boolean(row.isSpoiler),
      }),
      gameId: row.gameId,
      gameTitle: row.gameTitle,
    })),
  }).reviews;
}
