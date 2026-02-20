import { NextResponse } from "next/server";

import { pool } from "@/lib/db.ts";
import { DBUserRow } from "@/types/ws-server-types";

export async function GET(): Promise<NextResponse> {
  try {
    const { rows } = await pool.query<DBUserRow>(`
      SELECT id, username
      FROM users
      ORDER BY username ASC
    `);

    return NextResponse.json(rows);
  } catch (err) {
    console.log('Users API error: ', err);
    return NextResponse.json({
      success: true,
      message: 'Failed to fetch allUsers!',
      error: err instanceof Error ? err.message : err,
    }, { status: 500 });
  }
}