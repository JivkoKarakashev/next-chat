import { pool } from '../lib/db';

interface Session {
    userId: string,
    email: string
}

// Get session info by sessionId
const validateSession = async (sessionId: string): Promise<Session | undefined> => {
    const { rows } = await pool.query<Session>(`
        SELECT s.user_id AS "userId", u.email
        FROM sessions s
        JOIN users u ON u.id = s.user_id
        WHERE s.id = $1 AND s.expires_at > now()`
        , [sessionId]
    );
    return rows[0];
};

export {
    type Session,
    validateSession
}