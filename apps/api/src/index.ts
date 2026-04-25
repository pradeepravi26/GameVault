import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { gamesRoute } from "./routes/games";
import { genresRoute } from "./routes/genres";
import { healthRoute } from "./routes/health";
import { platformsRoute } from "./routes/platforms";
import { authRoute } from "./routes/auth";

const app = new Hono();
app.use(
  "*",
  cors({
    origin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
    credentials: true,
  }),
);
app.route("/", authRoute);
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
