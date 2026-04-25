import { Hono } from "hono";
import { getGameById, getGames } from "@gamevault/db";

export const gamesRoute = new Hono();

gamesRoute.get("/games", async (c) => {
  const result = await getGames({
    page: c.req.query("page"),
    pageSize: c.req.query("pageSize"),
    search: c.req.query("search"),
    genre: c.req.query("genre"),
    platform: c.req.query("platform"),
    releasedAfter: c.req.query("releasedAfter"),
    sort: c.req.query("sort"),
  });

  return c.json(result, 200);
});

gamesRoute.get("/games/:gameId", async (c) => {
  const gameId = Number(c.req.param("gameId"));

  if (!Number.isInteger(gameId) || gameId <= 0) {
    return c.json({ error: "Invalid gameId" }, 400);
  }

  const game = await getGameById(gameId);

  if (!game) {
    return c.json({ error: "Game not found" }, 404);
  }

  return c.json(game, 200);
});
