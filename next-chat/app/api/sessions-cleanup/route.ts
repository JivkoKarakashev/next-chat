import { NextResponse } from "next/server";

import { cleanupExpiredSessions } from "@/lib/sessions.ts";

export async function GET(): Promise<NextResponse> {
    await cleanupExpiredSessions();
    // return Response.json({ ok: true });
    return NextResponse.json({
        success: true,
        'expiredSessions-cleanup': 'successfully'
    });
}

export async function POST(req: Request): Promise<NextResponse> {
    const secret = req.headers.get('x-cron-secret');
    if (secret !== process.env.CRON_SECRET) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    await cleanupExpiredSessions();
    return NextResponse.json({
        success: true,
        'expiredSessions-cleanup': 'successfully'
    });
}