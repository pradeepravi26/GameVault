import type { RowDataPacket } from "mysql2";
import {
  gameDetailSchema,
  gameListResponseSchema,
  genreSchema,
  gamesQuerySchema,
  type GameDetail,
  type GameListItem,
  type GameListResponse,
  type GamesQuery,
  platformSchema,
  type Genre,
  type Platform,
} from "@gamevault/contracts";
import { dbPool } from "../client/pool";

interface GenreRow extends RowDataPacket {
  genreId: number;
  genreName: string;
}

interface PlatformRow extends RowDataPacket {
  platformId: number;
  platformName: string;
}

interface GameListRow extends RowDataPacket {
  gameId: number;
  title: string;
  imageUrl: string | null;
  firstReleaseDate: string | null;
  averageScore: string | number | null;
}

interface GameCountRow extends RowDataPacket {
  total: number;
}

interface GameDetailRow extends RowDataPacket {
  gameId: number;
  title: string;
  imageUrl: string | null;
  genres: string | null;
  platforms: string | null;
  averageScore: string | number | null;
  ratingCount: number;
}

const GAME_SORT_SQL: Record<GamesQuery["sort"], string> = {
  title: "g.title",
  releaseDate: "firstReleaseDate",
  averageScore: "averageScore",
};

function buildGamesFilterSql(query: GamesQuery) {
  const joins: string[] = [];
  const where: string[] = [];
  const values: Array<string | number> = [];

  if (query.genre) {
    joins.push(
      "JOIN game_genres AS gg ON g.game_id = gg.game_id",
      "JOIN genres AS ge ON gg.genre_id = ge.genre_id",
    );
    where.push("ge.genre_name = ?");
    values.push(query.genre);
  }

  if (query.platform) {
    joins.push(
      "JOIN game_platforms AS gp ON g.game_id = gp.game_id",
      "JOIN platforms AS p ON gp.platform_id = p.platform_id",
    );
    where.push("p.platform_name = ?");
    values.push(query.platform);
  }

  if (query.search) {
    where.push("g.title LIKE CONCAT('%', ?, '%')");
    values.push(query.search);
  }

  if (query.releasedAfter) {
    where.push(
      "(SELECT MIN(grd2.release_date) FROM game_release_dates AS grd2 WHERE grd2.game_id = g.game_id) >= ?",
    );
    values.push(query.releasedAfter);
  }

  return {
    joinSql: joins.join("\n"),
    whereSql: where.length > 0 ? `WHERE ${where.join(" AND ")}` : "",
    values,
  };
}

function normalizeAverageScore(value: string | number | null) {
  if (value === null) {
    return null;
  }

  return Number(value);
}

function splitConcatList(value: string | null) {
  if (!value) {
    return [];
  }

  return value.split("||");
}

export async function getGenres() {
  const [rows] = await dbPool.query<GenreRow[]>(
    `
      SELECT
        genre_id AS genreId,
        genre_name AS genreName
      FROM genres
      ORDER BY genre_name
    `,
  );

  return rows.map((row) => genreSchema.parse(row));
}

export async function getPlatforms() {
  const [rows] = await dbPool.query<PlatformRow[]>(
    `
      SELECT
        platform_id AS platformId,
        platform_name AS platformName
      FROM platforms
      ORDER BY platform_name
    `,
  );

  return rows.map((row) => platformSchema.parse(row));
}

export async function getGames(rawQuery: Record<string, string | undefined>) {
  const query = gamesQuerySchema.parse(rawQuery);
  const offset = (query.page - 1) * query.pageSize;
  const { joinSql, whereSql, values } = buildGamesFilterSql(query);
  const primaryDirection = query.direction.toUpperCase();
  const secondaryDirection =
    query.sort === "averageScore" && query.direction === "asc" ? "ASC" : "DESC";
  const orderBySql =
    query.sort === "averageScore"
      ? `${GAME_SORT_SQL[query.sort]} IS NULL ASC, ${GAME_SORT_SQL[query.sort]} ${primaryDirection}, g.title ASC`
      : `${GAME_SORT_SQL[query.sort]} ${primaryDirection}, g.title ${secondaryDirection}`;

  const [countRows] = await dbPool.query<GameCountRow[]>(
    `
      SELECT COUNT(DISTINCT g.game_id) AS total
      FROM games AS g
      ${joinSql}
      ${whereSql}
    `,
    values,
  );

  const [rows] = await dbPool.query<GameListRow[]>(
    `
      SELECT
        g.game_id AS gameId,
        g.title,
        gi.image_url AS imageUrl,
        DATE_FORMAT(MIN(grd.release_date), '%Y-%m-%d') AS firstReleaseDate,
        ROUND(AVG(ns.score), 2) AS averageScore
      FROM games AS g
      ${joinSql}
      LEFT JOIN game_images AS gi
        ON g.game_id = gi.game_id
       AND gi.image_id = 1
      LEFT JOIN game_release_dates AS grd
        ON g.game_id = grd.game_id
      LEFT JOIN ratings AS r
        ON g.game_id = r.game_id
      LEFT JOIN numeric_scores AS ns
        ON r.rating_id = ns.rating_id
      ${whereSql}
      GROUP BY g.game_id, g.title, gi.image_url
      ORDER BY ${orderBySql}
      LIMIT ? OFFSET ?
    `,
    [...values, query.pageSize, offset],
  );

  const items = rows.map((row) =>
    ({
      gameId: row.gameId,
      title: row.title,
      imageUrl: row.imageUrl,
      firstReleaseDate: row.firstReleaseDate,
      averageScore: normalizeAverageScore(row.averageScore),
    }) satisfies GameListItem,
  );

  return gameListResponseSchema.parse({
    items,
    page: query.page,
    pageSize: query.pageSize,
    total: countRows[0]?.total ?? 0,
  } satisfies GameListResponse);
}

export async function getGameById(gameId: number) {
  const [rows] = await dbPool.query<GameDetailRow[]>(
    `
      SELECT
        g.game_id AS gameId,
        g.title,
        gi.image_url AS imageUrl,
        GROUP_CONCAT(DISTINCT ge.genre_name ORDER BY ge.genre_name SEPARATOR '||') AS genres,
        GROUP_CONCAT(DISTINCT p.platform_name ORDER BY p.platform_name SEPARATOR '||') AS platforms,
        ROUND(AVG(ns.score), 2) AS averageScore,
        COUNT(DISTINCT r.rating_id) AS ratingCount
      FROM games AS g
      LEFT JOIN game_images AS gi
        ON g.game_id = gi.game_id
       AND gi.image_id = 1
      LEFT JOIN game_genres AS gg
        ON g.game_id = gg.game_id
      LEFT JOIN genres AS ge
        ON gg.genre_id = ge.genre_id
      LEFT JOIN game_platforms AS gp
        ON g.game_id = gp.game_id
      LEFT JOIN platforms AS p
        ON gp.platform_id = p.platform_id
      LEFT JOIN ratings AS r
        ON g.game_id = r.game_id
      LEFT JOIN numeric_scores AS ns
        ON r.rating_id = ns.rating_id
      WHERE g.game_id = ?
      GROUP BY g.game_id, g.title, gi.image_url
    `,
    [gameId],
  );

  const row = rows[0];

  if (!row) {
    return null;
  }

  return gameDetailSchema.parse({
    gameId: row.gameId,
    title: row.title,
    imageUrl: row.imageUrl,
    genres: splitConcatList(row.genres),
    platforms: splitConcatList(row.platforms),
    averageScore: normalizeAverageScore(row.averageScore),
    ratingCount: row.ratingCount,
  } satisfies GameDetail);
}
