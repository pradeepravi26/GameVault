import { Hono } from "hono";
import {
  addGameToCollection,
  createCollection,
  deleteCollection,
  getAllCollections,
  getCollectionById,
  getCollectionDetail,
  getCollectionsForUser,
  hasUserLikedCollection,
  likeCollection,
  removeGameFromCollection,
  renameCollection,
} from "@gamevault/db";
import {
  addGameToCollectionRequestSchema,
  collectionDetailSchema,
  collectionListResponseSchema,
  createCollectionRequestSchema,
  mutationSuccessSchema,
  myCollectionsResponseSchema,
  updateCollectionRequestSchema,
} from "@gamevault/contracts";
import { getRequestUser } from "../lib/auth";

export const collectionsRoute = new Hono();

collectionsRoute.get("/collections", async (c) => {
  const collections = await getAllCollections();
  return c.json(collectionListResponseSchema.parse({ collections }), 200);
});

collectionsRoute.get("/users/:userId/collections", async (c) => {
  const userId = Number(c.req.param("userId"));

  if (!Number.isInteger(userId) || userId <= 0) {
    return c.json({ error: "Invalid userId" }, 400);
  }

  const collections = await getCollectionsForUser(userId);
  return c.json(myCollectionsResponseSchema.parse({ collections }), 200);
});

collectionsRoute.post("/collections", async (c) => {
  const user = await getRequestUser(c);

  if (!user) {
    return c.json({ error: "Not authenticated." }, 401);
  }

  const body = await c.req.json();
  const input = createCollectionRequestSchema.parse(body);

  try {
    const collection = await createCollection({
      collectionName: input.collectionName,
      userId: user.userId,
    });

    return c.json(collectionDetailSchema.parse({ ...collection, games: [] }), 201);
  } catch {
    return c.json({ error: "Unable to create collection." }, 400);
  }
});

collectionsRoute.get("/collections/:collectionId", async (c) => {
  const collectionId = Number(c.req.param("collectionId"));

  if (!Number.isInteger(collectionId) || collectionId <= 0) {
    return c.json({ error: "Invalid collectionId" }, 400);
  }

  const collection = await getCollectionDetail(collectionId);

  if (!collection) {
    return c.json({ error: "Collection not found." }, 404);
  }

  return c.json(collectionDetailSchema.parse(collection), 200);
});

collectionsRoute.post("/collections/:collectionId/games", async (c) => {
  const collectionId = Number(c.req.param("collectionId"));

  if (!Number.isInteger(collectionId) || collectionId <= 0) {
    return c.json({ error: "Invalid collectionId" }, 400);
  }

  const user = await getRequestUser(c);

  if (!user) {
    return c.json({ error: "Not authenticated." }, 401);
  }

  const collection = await getCollectionById(collectionId);

  if (!collection) {
    return c.json({ error: "Collection not found." }, 404);
  }

  if (collection.userId !== user.userId) {
    return c.json({ error: "You do not own this collection." }, 403);
  }

  const body = await c.req.json();
  const input = addGameToCollectionRequestSchema.parse(body);

  try {
    await addGameToCollection({
      collectionId,
      gameId: input.gameId,
    });
  } catch {
    return c.json({ error: "Unable to add game to collection." }, 400);
  }

  const updatedCollection = await getCollectionDetail(collectionId);
  return c.json(collectionDetailSchema.parse(updatedCollection), 200);
});

collectionsRoute.delete("/collections/:collectionId/games/:gameId", async (c) => {
  const collectionId = Number(c.req.param("collectionId"));
  const gameId = Number(c.req.param("gameId"));

  if (
    !Number.isInteger(collectionId) ||
    collectionId <= 0 ||
    !Number.isInteger(gameId) ||
    gameId <= 0
  ) {
    return c.json({ error: "Invalid ids." }, 400);
  }

  const user = await getRequestUser(c);

  if (!user) {
    return c.json({ error: "Not authenticated." }, 401);
  }

  const collection = await getCollectionById(collectionId);

  if (!collection) {
    return c.json({ error: "Collection not found." }, 404);
  }

  if (collection.userId !== user.userId) {
    return c.json({ error: "You do not own this collection." }, 403);
  }

  const removed = await removeGameFromCollection({ collectionId, gameId });

  if (!removed) {
    return c.json({ error: "Game not found in collection." }, 404);
  }

  return c.json(mutationSuccessSchema.parse({ ok: true }), 200);
});

collectionsRoute.patch("/collections/:collectionId", async (c) => {
  const collectionId = Number(c.req.param("collectionId"));

  if (!Number.isInteger(collectionId) || collectionId <= 0) {
    return c.json({ error: "Invalid collectionId" }, 400);
  }

  const user = await getRequestUser(c);

  if (!user) {
    return c.json({ error: "Not authenticated." }, 401);
  }

  const body = await c.req.json();
  const input = updateCollectionRequestSchema.parse(body);

  try {
    const collection = await renameCollection({
      collectionId,
      userId: user.userId,
      collectionName: input.collectionName,
    });

    if (!collection) {
      return c.json({ error: "Collection not found." }, 404);
    }

    const detail = await getCollectionDetail(collection.collectionId);
    return c.json(collectionDetailSchema.parse(detail), 200);
  } catch {
    return c.json({ error: "Unable to rename collection." }, 400);
  }
});

collectionsRoute.delete("/collections/:collectionId", async (c) => {
  const collectionId = Number(c.req.param("collectionId"));

  if (!Number.isInteger(collectionId) || collectionId <= 0) {
    return c.json({ error: "Invalid collectionId" }, 400);
  }

  const user = await getRequestUser(c);

  if (!user) {
    return c.json({ error: "Not authenticated." }, 401);
  }

  const deleted = await deleteCollection({
    collectionId,
    userId: user.userId,
  });

  if (!deleted) {
    return c.json({ error: "Collection not found." }, 404);
  }

  return c.json(mutationSuccessSchema.parse({ ok: true }), 200);
});

collectionsRoute.post("/collections/:collectionId/like", async (c) => {
  const collectionId = Number(c.req.param("collectionId"));

  if (!Number.isInteger(collectionId) || collectionId <= 0) {
    return c.json({ error: "Invalid collectionId" }, 400);
  }

  const user = await getRequestUser(c);

  if (!user) {
    return c.json({ error: "Not authenticated." }, 401);
  }

  const collection = await getCollectionById(collectionId);

  if (!collection) {
    return c.json({ error: "Collection not found." }, 404);
  }

  const alreadyLiked = await hasUserLikedCollection({
    collectionId,
    userId: user.userId,
  });

  if (alreadyLiked) {
    return c.json({ error: "Collection already liked." }, 409);
  }

  await likeCollection({
    collectionId,
    userId: user.userId,
  });

  const detail = await getCollectionDetail(collectionId);
  return c.json(collectionDetailSchema.parse(detail), 200);
});
