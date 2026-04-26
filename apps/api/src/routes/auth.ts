import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import {
  authResponseSchema,
  loginRequestSchema,
  registerRequestSchema,
} from "@gamevault/contracts";
import { createUser, findUserByUsername } from "@gamevault/db";
import {
  createSession,
  deleteSession,
  getSessionCookieName,
  getUserFromSession,
  hashPassword,
  toAuthUser,
  verifyPassword,
} from "../lib/auth";

const sessionCookieName = getSessionCookieName();

function setSessionCookie(c: Parameters<typeof setCookie>[0], sessionId: string) {
  setCookie(c, sessionCookieName, sessionId, {
    httpOnly: true,
    sameSite: "Lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });
}

function clearSessionCookie(c: Parameters<typeof deleteCookie>[0]) {
  deleteCookie(c, sessionCookieName, {
    path: "/",
  });
}

export const authRoute = new Hono();

authRoute.post("/auth/register", async (c) => {
  const body = await c.req.json();
  const input = registerRequestSchema.parse(body);
  const existingUser = await findUserByUsername(input.username);

  if (existingUser) {
    return c.json({ error: "Username is already taken." }, 409);
  }

  const passwordHash = await hashPassword(input.password);
  const createdUser = await createUser({
    username: input.username,
    passwordHash,
    firstName: input.firstName || undefined,
    lastName: input.lastName || undefined,
  });

  if (!createdUser) {
    return c.json({ error: "Unable to create user." }, 500);
  }

  const sessionId = await createSession(createdUser.userId);
  setSessionCookie(c, sessionId);

  return c.json(authResponseSchema.parse({ user: toAuthUser(createdUser) }), 201);
});

authRoute.post("/auth/login", async (c) => {
  const body = await c.req.json();
  const input = loginRequestSchema.parse(body);
  const user = await findUserByUsername(input.username);

  if (!user) {
    return c.json({ error: "Invalid username or password." }, 401);
  }

  const isValidPassword = await verifyPassword(input.password, user.passwordHash);

  if (!isValidPassword) {
    return c.json({ error: "Invalid username or password." }, 401);
  }

  const sessionId = await createSession(user.userId);
  setSessionCookie(c, sessionId);

  return c.json(authResponseSchema.parse({ user: toAuthUser(user) }), 200);
});

authRoute.post("/auth/logout", async (c) => {
  const sessionId = getCookie(c, sessionCookieName);
  await deleteSession(sessionId);
  clearSessionCookie(c);
  return c.json({ ok: true }, 200);
});

authRoute.get("/auth/me", async (c) => {
  const sessionId = getCookie(c, sessionCookieName);
  const user = await getUserFromSession(sessionId);

  if (!user) {
    return c.json({ error: "Not authenticated." }, 401);
  }

  return c.json(authResponseSchema.parse({ user }), 200);
});
