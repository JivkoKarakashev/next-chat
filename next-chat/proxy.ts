import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isDevEnv = process.env.NODE_ENV === 'development';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function proxy(req: NextRequest) {
  if (isDevEnv) {
    return NextResponse.next();
  }

  const { pathname } = req.nextUrl;

  // 1. WebSocket proxy (Render backend)
  if (pathname === '/ws') {
    const url = req.nextUrl.clone();
    url.protocol = 'https:'; // browser upgrades to wss
    url.hostname = 'socket-next.onrender.com';
    url.port = '';
    return NextResponse.rewrite(url);
  }

  // CSP (production only)
  const res = NextResponse.next();
  const csp = `
  default-src 'self';
  connect-src 'self' https://socket-next.onrender.com wss://socket-next.onrender.com;
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https://img.daisyui.com;
`;
  // Add Content-Security-Policy header
  res.headers.set('Content-Security-Policy', csp.replace(/\n/g, ' '));
  return res;
}

// Apply middleware
export const config = {
  matcher: ['/ws', '/chat/:path*', '/api/:path*'],
}
