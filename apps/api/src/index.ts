import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { serve } from "@hono/node-server";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../../../.env");
if (fs.existsSync(envPath)) {
  const text = fs.readFileSync(envPath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}
import { Hono } from "hono";
import { cors } from "hono/cors";
import { gamesRoute } from "./routes/games";
import { genresRoute } from "./routes/genres";
import { healthRoute } from "./routes/health";
import { platformsRoute } from "./routes/platforms";
import { authRoute } from "./routes/auth";
import { reviewsRoute } from "./routes/reviews";
import { collectionsRoute } from "./routes/collections";
import { usersRoute } from "./routes/users";

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
app.route("/", reviewsRoute);
app.route("/", collectionsRoute);
app.route("/", usersRoute);

const port = Number(process.env.PORT ?? 3001);

serve({
  fetch: app.fetch,
  port,
});

console.log(`API running on http://localhost:${port}`);
