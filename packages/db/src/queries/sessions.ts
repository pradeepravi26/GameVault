import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { dbPool } from "../client/pool";

interface SessionRow extends RowDataPacket {
  sessionId: string;
  userId: number;
  expiresAt: Date;
}

export async function createSessionRecord(input: {
  sessionId: string;
  userId: number;
  expiresAt: Date;
}) {
  await dbPool.execute(
    `
      INSERT INTO sessions (session_id, user_id, expires_at)
      VALUES (?, ?, ?)
    `,
    [input.sessionId, input.userId, input.expiresAt],
  );
}

export async function findSessionById(sessionId: string) {
  const [rows] = await dbPool.query<SessionRow[]>(
    `
      SELECT
        session_id AS sessionId,
        user_id AS userId,
        expires_at AS expiresAt
      FROM sessions
      WHERE session_id = ?
      LIMIT 1
    `,
    [sessionId],
  );

  return rows[0] ?? null;
}

export async function deleteSessionRecord(sessionId: string) {
  const [result] = await dbPool.execute<ResultSetHeader>(
    `
      DELETE FROM sessions
      WHERE session_id = ?
    `,
    [sessionId],
  );

  return result.affectedRows > 0;
}

export async function deleteExpiredSessions() {
  await dbPool.execute(
    `
      DELETE FROM sessions
      WHERE expires_at <= NOW()
    `,
  );
}
