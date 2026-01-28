import { AuthUser, RegisterUser } from '@/types/user.ts';
import { pool } from '@/lib/db.ts';

const createUser = async ({ email, hash, created_at }: RegisterUser): Promise<number> => {
  const { rows } = await pool.query<{ id: number }>(`
    INSERT INTO users (email, password, created_at)
    VALUES ($1, $2, $3)
    RETURNING id
  `, [email, hash, created_at]);
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