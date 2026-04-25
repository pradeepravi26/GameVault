import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { healthResponseSchema } from "@gamevault/contracts";

const app = new Hono();

app.get("/health", (c) => {
  return c.json(healthResponseSchema.parse({ ok: true }));
});

const port = Number(process.env.PORT ?? 3001);

serve({
  fetch: app.fetch,
  port,
});

console.log(`API running on http://localhost:${port}`);
