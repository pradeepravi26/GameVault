import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { AuthUser } from "@gamevault/contracts";
import { findUserById } from "@gamevault/db";

const scrypt = promisify(scryptCallback);
const SESSION_COOKIE_NAME = "gamevault_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;

interface SessionRecord {
  userId: number;
  expiresAt: number;
}

const sessionStore = new Map<string, SessionRecord>();

export function toAuthUser(user: {
  userId: number;
  username: string;
  firstName: string | null;
  lastName: string | null;
}) {
  return {
    userId: user.userId,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
  } satisfies AuthUser;
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, passwordHash: string) {
  const [salt, key] = passwordHash.split(":");

  if (!salt || !key) {
    return false;
  }

  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  const storedKey = Buffer.from(key, "hex");

  if (storedKey.length !== derivedKey.length) {
    return false;
  }

  return timingSafeEqual(storedKey, derivedKey);
}

export function createSession(userId: number) {
  const sessionId = randomBytes(32).toString("hex");

  sessionStore.set(sessionId, {
    userId,
    expiresAt: Date.now() + SESSION_DURATION_MS,
  });

  return sessionId;
}

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME;
}

export function deleteSession(sessionId: string | undefined) {
  if (!sessionId) {
    return;
  }

  sessionStore.delete(sessionId);
}

export async function getUserFromSession(sessionId: string | undefined) {
  if (!sessionId) {
    return null;
  }

  const session = sessionStore.get(sessionId);

  if (!session) {
    return null;
  }

  if (session.expiresAt <= Date.now()) {
    sessionStore.delete(sessionId);
    return null;
  }

  const user = await findUserById(session.userId);

  if (!user) {
    sessionStore.delete(sessionId);
    return null;
  }

  return toAuthUser(user);
}
