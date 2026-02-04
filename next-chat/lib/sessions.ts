import { pool } from "./db.ts";
import { SESSION_TTL, Session } from "@/types/session.ts";
import { generateSecureRandomString as generateSessionId } from "@/utils/secure-random-string.ts";

const createSession = async (user_id: string): Promise<Session> => {
  const sessionId = generateSessionId();
  const created_at = new Date();
  const expires_at = new Date(created_at.getTime() + SESSION_TTL);

  const { rows } = await pool.query<Session>(`
        INSERT INTO sessions (id, created_at, expires_at, user_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `, [sessionId, created_at, expires_at, user_id]);
  return rows[0];
};

const validateSession = async (session_id: string): Promise<Session | undefined> => {
  const { rows } = await pool.query<Session>(`
        SELECT *
        FROM sessions
        WHERE id = $1
        LIMIT 1
    `, [session_id]);
  const now = new Date();
  const session = rows[0];
  const { expires_at } = session;
  const expired = session && expires_at < now;

  if (session === undefined || expired) {
    if (expired) {
      await deleteSession(session_id);
    }
    return undefined;
  }

  return session;
};

const deleteSession = async (sessionId: string): Promise<void> => {
  await pool.query(`
        DELETE FROM
        sessions
        WHERE id = $1 AND expires_at > now()
    `, [sessionId]);
};

const cleanupExpiredSessions = async (): Promise<void> => {
  const { rowCount } = await pool.query<{ count: number }>(`
        DELETE FROM
        sessions
        WHERE expires_at < now()
    `);
  console.log(`Cleaned up ${rowCount ?? 0} expired sessions.`);
};

export {
  createSession,
  validateSession,
  deleteSession,
  cleanupExpiredSessions
}