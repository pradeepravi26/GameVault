import { z } from "zod";

export const healthResponseSchema = z.object({
  ok: z.boolean(),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;

const optionalTrimmedString = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}, z.string().min(1).optional());

export const gamesSortSchema = z.enum(["title", "releaseDate", "averageScore"]);
export const gamesSortDirectionSchema = z.enum(["asc", "desc"]);

export const gamesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: optionalTrimmedString,
  genre: optionalTrimmedString,
  platform: optionalTrimmedString,
  releasedAfter: z.preprocess((value) => {
    if (typeof value !== "string") {
      return value;
    }

    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  }, z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  sort: gamesSortSchema.default("title"),
  direction: gamesSortDirectionSchema.default("asc"),
});

export const genreSchema = z.object({
  genreId: z.number().int(),
  genreName: z.string(),
});

export const platformSchema = z.object({
  platformId: z.number().int(),
  platformName: z.string(),
});

export const gameListItemSchema = z.object({
  gameId: z.number().int(),
  title: z.string(),
  imageUrl: z.string().nullable(),
  firstReleaseDate: z.string().nullable(),
  averageScore: z.number().nullable(),
});

export const gameListResponseSchema = z.object({
  items: z.array(gameListItemSchema),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  total: z.number().int().min(0),
});

export const gameDetailSchema = z.object({
  gameId: z.number().int(),
  title: z.string(),
  imageUrl: z.string().nullable(),
  genres: z.array(z.string()),
  platforms: z.array(z.string()),
  averageScore: z.number().nullable(),
  ratingCount: z.number().int().min(0),
});

export const authUserSchema = z.object({
  userId: z.number().int(),
  username: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
});

export const registerRequestSchema = z.object({
  username: z.string().trim().min(3).max(50),
  password: z.string().min(8).max(100),
  firstName: z.string().trim().max(50).optional().default(""),
  lastName: z.string().trim().max(50).optional().default(""),
});

export const loginRequestSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

export const authResponseSchema = z.object({
  user: authUserSchema,
});

export type GamesQuery = z.infer<typeof gamesQuerySchema>;
export type Genre = z.infer<typeof genreSchema>;
export type Platform = z.infer<typeof platformSchema>;
export type GameListItem = z.infer<typeof gameListItemSchema>;
export type GameListResponse = z.infer<typeof gameListResponseSchema>;
export type GameDetail = z.infer<typeof gameDetailSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
