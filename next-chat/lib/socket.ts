export const createWebSocket = (sessionId: string) => {
  // const wsUrl = process.env.NEXT_PUBLIC_WS_URL!;
  // return new WebSocket(wsUrl);
  const wsUrl = process.env.NODE_ENV === 'development'
    ? 'ws://localhost:3030/ws'
    : process.env.NEXT_PUBLIC_WS_URL ?? 'wss://socket-next.onrender.com/ws';
  const url = new URL(wsUrl);
  url.searchParams.set('session', sessionId);

  console.log('[WS] connecting to:', url.toString(), 'env:', process.env.NODE_ENV);
  return new WebSocket(url.toString());
};