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

export const gameReviewSchema = z.object({
  ratingId: z.number().int(),
  postedAt: z.string(),
  userId: z.number().int(),
  username: z.string(),
  score: z.number().min(1).max(10).nullable(),
  reviewBody: z.string().nullable(),
  isSpoiler: z.boolean(),
});

export const gameReviewsResponseSchema = z.object({
  reviews: z.array(gameReviewSchema),
});

export const myGameReviewResponseSchema = z.object({
  review: gameReviewSchema.nullable(),
});

export const upsertGameReviewRequestSchema = z.object({
  score: z.coerce.number().min(1).max(10),
  reviewBody: z.string().trim().max(5000).optional().default(""),
  isSpoiler: z.boolean().optional().default(false),
});

export const deleteReviewResponseSchema = z.object({
  ok: z.boolean(),
});

export const collectionSummarySchema = z.object({
  collectionId: z.number().int(),
  collectionName: z.string(),
  userId: z.number().int(),
  username: z.string(),
  likeCount: z.number().int().min(0),
  gameCount: z.number().int().min(0),
});

export const collectionGameSchema = z.object({
  gameId: z.number().int(),
  title: z.string(),
  imageUrl: z.string().nullable(),
  firstReleaseDate: z.string().nullable(),
});

export const collectionDetailSchema = collectionSummarySchema.extend({
  games: z.array(collectionGameSchema),
});

export const collectionListResponseSchema = z.object({
  collections: z.array(collectionSummarySchema),
});

export const myCollectionsResponseSchema = z.object({
  collections: z.array(collectionSummarySchema),
});

export const createCollectionRequestSchema = z.object({
  collectionName: z.string().trim().min(1).max(100),
});

export const updateCollectionRequestSchema = z.object({
  collectionName: z.string().trim().min(1).max(100),
});

export const addGameToCollectionRequestSchema = z.object({
  gameId: z.number().int().positive(),
});

export const mutationSuccessSchema = z.object({
  ok: z.boolean(),
});

export const authUserSchema = z.object({
  userId: z.number().int(),
  username: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
});

export const userProfileSchema = authUserSchema;

export const userReviewSchema = gameReviewSchema.extend({
  gameId: z.number().int(),
  gameTitle: z.string(),
});

export const userReviewsResponseSchema = z.object({
  reviews: z.array(userReviewSchema),
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
export type GameReview = z.infer<typeof gameReviewSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type GameReviewsResponse = z.infer<typeof gameReviewsResponseSchema>;
export type UserReview = z.infer<typeof userReviewSchema>;
export type UserReviewsResponse = z.infer<typeof userReviewsResponseSchema>;
export type MyGameReviewResponse = z.infer<typeof myGameReviewResponseSchema>;
export type UpsertGameReviewRequest = z.infer<typeof upsertGameReviewRequestSchema>;
export type CollectionSummary = z.infer<typeof collectionSummarySchema>;
export type CollectionGame = z.infer<typeof collectionGameSchema>;
export type CollectionDetail = z.infer<typeof collectionDetailSchema>;
export type CollectionListResponse = z.infer<typeof collectionListResponseSchema>;
export type MyCollectionsResponse = z.infer<typeof myCollectionsResponseSchema>;
export type CreateCollectionRequest = z.infer<typeof createCollectionRequestSchema>;
export type UpdateCollectionRequest = z.infer<typeof updateCollectionRequestSchema>;
export type AddGameToCollectionRequest = z.infer<typeof addGameToCollectionRequestSchema>;
