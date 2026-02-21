import { AuthUser, RegisterUser } from '@/types/user.ts';
import { pool } from '@/lib/db.ts';
import { DBUserRow } from '@/types/ws-server-types.ts';

const createUser = async ({ id, username, email, hash, created_at }: RegisterUser): Promise<string> => {
  // console.log({ id, username, email, hash, created_at });
  const { rows } = await pool.query<{ id: string }>(`
    INSERT INTO users (id, username, email, password, created_at)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
  `, [id, username, email, hash, created_at]);
  return rows[0].id;
};

const getUserByEmail = async (email: string): Promise<AuthUser | undefined> => {
  const { rows } = await pool.query<AuthUser>(`
    SELECT *
    FROM users
    WHERE email = $1
    LIMIT 1
  `, [email]);
  return rows[0] ?? undefined;
};

const createdUserNotification = async (user: DBUserRow) => {
  const body = JSON.stringify(user);
  const options: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-secret': process.env.X_INTERNAL_SECRET!
    },
    body
  };
  await fetch('http://localhost:3030/internal/user-created', options);
};

export {
  createUser,
  getUserByEmail,
  createdUserNotification
}