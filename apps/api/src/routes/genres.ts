import { Hono } from "hono";
import { getGenres } from "@gamevault/db";

export const genresRoute = new Hono();

genresRoute.get("/genres", async (c) => {
  const genres = await getGenres();

  return c.json(genres, 200);
});
