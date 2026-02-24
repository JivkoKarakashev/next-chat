import { NextResponse } from "next/server";

// Set WebSocket URL based on environment
const wsSrc =
  process.env.NODE_ENV === 'development'
    ? 'ws://localhost:3030'
    : 'wss://socket-next.onrender.com';

const csp = `
    default-src 'self';
    connect-src 'self' ${wsSrc};  
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https://img.daisyui.com;
  `;

export function proxy() {
  const res = NextResponse.next();

  // Add Content-Security-Policy header
  res.headers.set('Content-Security-Policy', csp.replace(/\n/g, ' '));
  return res;
}

// Apply middleware
export const config = {
  matcher: ['/chat/:path*', '/api/:path*'],
}
