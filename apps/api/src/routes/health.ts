import { Hono } from "hono";
import { healthResponseSchema } from "@gamevault/contracts";

export const healthRoute = new Hono();

healthRoute.get("/health", (c) => {
  const response = healthResponseSchema.parse({ ok: true });

  return c.json(response, 200);
});
