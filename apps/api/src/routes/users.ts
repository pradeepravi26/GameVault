import { Hono } from "hono";
import { getReviewsByUser, getUserProfileById } from "@gamevault/db";
import {
  userProfileSchema,
  userReviewsResponseSchema,
} from "@gamevault/contracts";

export const usersRoute = new Hono();

usersRoute.get("/users/:userId", async (c) => {
  const userId = Number(c.req.param("userId"));

  if (!Number.isInteger(userId) || userId <= 0) {
    return c.json({ error: "Invalid userId" }, 400);
  }

  const user = await getUserProfileById(userId);

  if (!user) {
    return c.json({ error: "User not found." }, 404);
  }

  return c.json(userProfileSchema.parse(user), 200);
});

usersRoute.get("/users/:userId/reviews", async (c) => {
  const userId = Number(c.req.param("userId"));

  if (!Number.isInteger(userId) || userId <= 0) {
    return c.json({ error: "Invalid userId" }, 400);
  }

  const user = await getUserProfileById(userId);

  if (!user) {
    return c.json({ error: "User not found." }, 404);
  }

  const reviews = await getReviewsByUser(userId);
  return c.json(userReviewsResponseSchema.parse({ reviews }), 200);
});
