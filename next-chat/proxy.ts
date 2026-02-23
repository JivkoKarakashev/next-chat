import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const wsSrc =
  process.env.NODE_ENV === 'development'
    ? 'ws://localhost:3030 http://localhost:3030'
    : 'https://socket-next.onrender.com wss://socket-next.onrender.com';

const csp = `
  default-src 'self';
  connect-src 'self' ${wsSrc};
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https://img.daisyui.com;
`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function proxy(_req: NextRequest) {
  const res = NextResponse.next();

  // Add Content-Security-Policy header
  res.headers.set("Content-Security-Policy", csp.replace(/\n/g, " "));

  return res;
}

// Apply middleware only to chat page
export const config = {
  matcher: ["/chat/:path*", "/api/:path*"],
}
