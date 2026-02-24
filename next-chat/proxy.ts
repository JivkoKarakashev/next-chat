import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isDevEnv = process.env.NODE_ENV === 'development';

const wsConnectSrc = isDevEnv
  ? 'ws://localhost:3030 http://localhost:3030'
  : 'https://socket-next.onrender.com wss://socket-next.onrender.com';

const csp = `
  default-src 'self';
  connect-src 'self' ${wsConnectSrc};
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https://img.daisyui.com;
`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. WebSocket proxy (Render backend)
  if (pathname === '/ws') {
    const url = req.nextUrl.clone();

    url.protocol = 'https:'; // browser upgrades to wss
    url.hostname = 'socket-next.onrender.com';
    url.port = '';

    return NextResponse.rewrite(url);
  }

  // 2. Normal HTTP requests → add CSP 
  const res = NextResponse.next();
  // Add Content-Security-Policy header
  res.headers.set('Content-Security-Policy', csp.replace(/\n/g, ' '));
  return res;
}

// Apply middleware
export const config = {
  matcher: ['/ws', '/chat/:path*', '/api/:path*'],
}
