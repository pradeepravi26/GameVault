import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { gamesRoute } from "./routes/games";
import { genresRoute } from "./routes/genres";
import { healthRoute } from "./routes/health";
import { platformsRoute } from "./routes/platforms";

const app = new Hono();
app.route("/", healthRoute);
app.route("/", genresRoute);
app.route("/", platformsRoute);
app.route("/", gamesRoute);

const port = Number(process.env.PORT ?? 3001);

serve({
  fetch: app.fetch,
  port,
});

console.log(`API running on http://localhost:${port}`);
