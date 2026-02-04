import { AuthUser, RegisterUser } from '@/types/user.ts';
import { pool } from '@/lib/db.ts';

const createUser = async ({ id, email, hash, created_at }: RegisterUser): Promise<string> => {
  const { rows } = await pool.query<{ id: string }>(`
    INSERT INTO users (id, email, password, created_at)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `, [id, email, hash, created_at]);
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

export {
  createUser,
  getUserByEmail
}