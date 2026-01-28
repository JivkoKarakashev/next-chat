import { NextResponse } from 'next/server';

import { pool } from '@/lib/db.ts';

export async function GET(): Promise<NextResponse> {
    try {
        // simple query just to test the connection
        const { rows } = await pool.query('SELECT NOW()');
        return NextResponse.json({
            success: true,
            serverTime: rows[0].now,
        });
    } catch (error) {
        console.error('DB connection failed:', error);
        return NextResponse.json({
            success: false,
            message: 'Cannot connect to database!',
            error: error instanceof Error ? error.message : error,
        }, { status: 500 });
    }
}
