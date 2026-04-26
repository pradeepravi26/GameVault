import { Hono } from "hono";
import { getPlatforms } from "@gamevault/db";

export const platformsRoute = new Hono();

platformsRoute.get("/platforms", async (c) => {
  const platforms = await getPlatforms();

  return c.json(platforms, 200);
});
