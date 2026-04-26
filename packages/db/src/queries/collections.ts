import type { ResultSetHeader, RowDataPacket } from "mysql2";
import {
  collectionDetailSchema,
  collectionGameSchema,
  collectionListResponseSchema,
  collectionSummarySchema,
  myCollectionsResponseSchema,
  type CollectionDetail,
  type CollectionGame,
  type CollectionSummary,
} from "@gamevault/contracts";
import { dbPool } from "../client/pool";

interface CollectionSummaryRow extends RowDataPacket {
  collectionId: number;
  collectionName: string;
  userId: number;
  username: string;
  likeCount: number;
  gameCount: number;
  likedByCurrentUser: number;
}

interface CollectionGameRow extends RowDataPacket {
  gameId: number;
  title: string;
  imageUrl: string | null;
  firstReleaseDate: string | null;
}

function normalizeCollectionSummary(row: CollectionSummaryRow) {
  return collectionSummarySchema.parse({
    collectionId: row.collectionId,
    collectionName: row.collectionName,
    userId: row.userId,
    username: row.username,
    likeCount: Number(row.likeCount),
    gameCount: Number(row.gameCount),
    likedByCurrentUser: Boolean(row.likedByCurrentUser),
  } satisfies CollectionSummary);
}

function normalizeCollectionGame(row: CollectionGameRow) {
  return collectionGameSchema.parse({
    gameId: row.gameId,
    title: row.title,
    imageUrl: row.imageUrl,
    firstReleaseDate: row.firstReleaseDate,
  } satisfies CollectionGame);
}

export async function getAllCollections(currentUserId?: number) {
  const [rows] = await dbPool.query<CollectionSummaryRow[]>(
    `
      SELECT
        c.collection_id AS collectionId,
        c.collection_name AS collectionName,
        u.user_id AS userId,
        u.username,
        COUNT(DISTINCT cl.user_id) AS likeCount,
        COUNT(DISTINCT cg.game_id) AS gameCount,
        MAX(CASE WHEN cl.user_id = ? THEN 1 ELSE 0 END) AS likedByCurrentUser
      FROM collections AS c
      JOIN users AS u
        ON c.user_id = u.user_id
      LEFT JOIN collection_likes AS cl
        ON c.collection_id = cl.collection_id
      LEFT JOIN collection_games AS cg
        ON c.collection_id = cg.collection_id
      GROUP BY c.collection_id, c.collection_name, u.user_id, u.username
      ORDER BY likeCount DESC, c.collection_name ASC
    `,
    [currentUserId ?? -1],
  );

  return collectionListResponseSchema.parse({
    collections: rows.map(normalizeCollectionSummary),
  }).collections;
}

export async function getCollectionsForUser(userId: number, currentUserId?: number) {
  const [rows] = await dbPool.query<CollectionSummaryRow[]>(
    `
      SELECT
        c.collection_id AS collectionId,
        c.collection_name AS collectionName,
        u.user_id AS userId,
        u.username,
        COUNT(DISTINCT cl.user_id) AS likeCount,
        COUNT(DISTINCT cg.game_id) AS gameCount,
        MAX(CASE WHEN cl.user_id = ? THEN 1 ELSE 0 END) AS likedByCurrentUser
      FROM collections AS c
      JOIN users AS u
        ON c.user_id = u.user_id
      LEFT JOIN collection_likes AS cl
        ON c.collection_id = cl.collection_id
      LEFT JOIN collection_games AS cg
        ON c.collection_id = cg.collection_id
      WHERE c.user_id = ?
      GROUP BY c.collection_id, c.collection_name, u.user_id, u.username
      ORDER BY c.collection_name ASC
    `,
    [currentUserId ?? -1, userId],
  );

  return myCollectionsResponseSchema.parse({
    collections: rows.map(normalizeCollectionSummary),
  }).collections;
}

export async function getCollectionById(collectionId: number, currentUserId?: number) {
  const [rows] = await dbPool.query<CollectionSummaryRow[]>(
    `
      SELECT
        c.collection_id AS collectionId,
        c.collection_name AS collectionName,
        u.user_id AS userId,
        u.username,
        COUNT(DISTINCT cl.user_id) AS likeCount,
        COUNT(DISTINCT cg.game_id) AS gameCount,
        MAX(CASE WHEN cl.user_id = ? THEN 1 ELSE 0 END) AS likedByCurrentUser
      FROM collections AS c
      JOIN users AS u
        ON c.user_id = u.user_id
      LEFT JOIN collection_likes AS cl
        ON c.collection_id = cl.collection_id
      LEFT JOIN collection_games AS cg
        ON c.collection_id = cg.collection_id
      WHERE c.collection_id = ?
      GROUP BY c.collection_id, c.collection_name, u.user_id, u.username
      LIMIT 1
    `,
    [currentUserId ?? -1, collectionId],
  );

  const row = rows[0];
  return row ? normalizeCollectionSummary(row) : null;
}

export async function getGamesForCollection(collectionId: number) {
  const [rows] = await dbPool.query<CollectionGameRow[]>(
    `
      SELECT
        g.game_id AS gameId,
        g.title,
        gi.image_url AS imageUrl,
        DATE_FORMAT(MIN(grd.release_date), '%Y-%m-%d') AS firstReleaseDate
      FROM collection_games AS cg
      JOIN games AS g
        ON cg.game_id = g.game_id
      LEFT JOIN game_images AS gi
        ON g.game_id = gi.game_id
       AND gi.image_id = 1
      LEFT JOIN game_release_dates AS grd
        ON g.game_id = grd.game_id
      WHERE cg.collection_id = ?
      GROUP BY g.game_id, g.title, gi.image_url
      ORDER BY g.title ASC
    `,
    [collectionId],
  );

  return rows.map(normalizeCollectionGame);
}

export async function getCollectionDetail(collectionId: number, currentUserId?: number) {
  const collection = await getCollectionById(collectionId, currentUserId);

  if (!collection) {
    return null;
  }

  const games = await getGamesForCollection(collectionId);

  return collectionDetailSchema.parse({
    ...collection,
    games,
  } satisfies CollectionDetail);
}

export async function createCollection(input: {
  collectionName: string;
  userId: number;
}) {
  const [result] = await dbPool.execute<ResultSetHeader>(
    `
      INSERT INTO collections (collection_name, user_id)
      VALUES (?, ?)
    `,
    [input.collectionName, input.userId],
  );

  return getCollectionById(result.insertId);
}

export async function renameCollection(input: {
  collectionId: number;
  userId: number;
  collectionName: string;
}) {
  const [result] = await dbPool.execute<ResultSetHeader>(
    `
      UPDATE collections
      SET collection_name = ?
      WHERE collection_id = ?
        AND user_id = ?
    `,
    [input.collectionName, input.collectionId, input.userId],
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return getCollectionById(input.collectionId);
}

export async function deleteCollection(input: {
  collectionId: number;
  userId: number;
}) {
  const [result] = await dbPool.execute<ResultSetHeader>(
    `
      DELETE FROM collections
      WHERE collection_id = ?
        AND user_id = ?
    `,
    [input.collectionId, input.userId],
  );

  return result.affectedRows > 0;
}

export async function addGameToCollection(input: {
  collectionId: number;
  gameId: number;
}) {
  await dbPool.execute(
    `
      INSERT INTO collection_games (collection_id, game_id)
      VALUES (?, ?)
    `,
    [input.collectionId, input.gameId],
  );
}

export async function removeGameFromCollection(input: {
  collectionId: number;
  gameId: number;
}) {
  const [result] = await dbPool.execute<ResultSetHeader>(
    `
      DELETE FROM collection_games
      WHERE collection_id = ?
        AND game_id = ?
    `,
    [input.collectionId, input.gameId],
  );

  return result.affectedRows > 0;
}

export async function likeCollection(input: {
  collectionId: number;
  userId: number;
}) {
  await dbPool.execute(
    `
      INSERT INTO collection_likes (collection_id, user_id)
      VALUES (?, ?)
    `,
    [input.collectionId, input.userId],
  );
}

export async function hasUserLikedCollection(input: {
  collectionId: number;
  userId: number;
}) {
  const [rows] = await dbPool.query<RowDataPacket[]>(
    `
      SELECT 1
      FROM collection_likes
      WHERE collection_id = ?
        AND user_id = ?
      LIMIT 1
    `,
    [input.collectionId, input.userId],
  );

  return rows.length > 0;
}

export async function unlikeCollection(input: {
  collectionId: number;
  userId: number;
}) {
  const [result] = await dbPool.execute<ResultSetHeader>(
    `
      DELETE FROM collection_likes
      WHERE collection_id = ?
        AND user_id = ?
    `,
    [input.collectionId, input.userId],
  );

  return result.affectedRows > 0;
}
