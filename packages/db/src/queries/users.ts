import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { userProfileSchema } from "@gamevault/contracts";
import { dbPool } from "../client/pool";

interface UserRow extends RowDataPacket {
  userId: number;
  username: string;
  passwordHash: string;
  firstName: string | null;
  lastName: string | null;
}

export interface DbUser {
  userId: number;
  username: string;
  passwordHash: string;
  firstName: string | null;
  lastName: string | null;
}

export async function findUserByUsername(username: string) {
  const [rows] = await dbPool.query<UserRow[]>(
    `
      SELECT
        user_id AS userId,
        username,
        password_hash AS passwordHash,
        first_name AS firstName,
        last_name AS lastName
      FROM users
      WHERE username = ?
      LIMIT 1
    `,
    [username],
  );

  const row = rows[0];

  if (!row) {
    return null;
  }

  return {
    userId: row.userId,
    username: row.username,
    passwordHash: row.passwordHash,
    firstName: row.firstName,
    lastName: row.lastName,
  } satisfies DbUser;
}

export async function findUserById(userId: number) {
  const [rows] = await dbPool.query<UserRow[]>(
    `
      SELECT
        user_id AS userId,
        username,
        password_hash AS passwordHash,
        first_name AS firstName,
        last_name AS lastName
      FROM users
      WHERE user_id = ?
      LIMIT 1
    `,
    [userId],
  );

  const row = rows[0];

  if (!row) {
    return null;
  }

  return {
    userId: row.userId,
    username: row.username,
    passwordHash: row.passwordHash,
    firstName: row.firstName,
    lastName: row.lastName,
  } satisfies DbUser;
}

export async function createUser(input: {
  username: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
}) {
  const [result] = await dbPool.execute<ResultSetHeader>(
    `
      INSERT INTO users (username, password_hash, first_name, last_name)
      VALUES (?, ?, ?, ?)
    `,
    [
      input.username,
      input.passwordHash,
      input.firstName ?? null,
      input.lastName ?? null,
    ],
  );

  return findUserById(result.insertId);
}

export async function getUserProfileById(userId: number) {
  const user = await findUserById(userId);

  if (!user) {
    return null;
  }

  return userProfileSchema.parse({
    userId: user.userId,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
  });
}
