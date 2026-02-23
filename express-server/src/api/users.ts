import { pool } from "../lib/db";
import { DBUserRow } from "../ws/ws-server-types";

const getAllUsers = async (): Promise<DBUserRow[]> => {
  const { rows } = await pool.query<DBUserRow>(`
      SELECT id, username
      FROM users
      ORDER BY username ASC
    `);

  return rows;
};

export {
  getAllUsers
}