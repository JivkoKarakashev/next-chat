export const createWebSocket = () => {
  // const wsUrl = process.env.NEXT_PUBLIC_WS_URL!;
  // return new WebSocket(wsUrl);
  const isDevEnv = process.env.NODE_ENV === 'development';
  const url = isDevEnv
    ? 'ws://localhost:3030/ws'
    : 'wss://socket-next.onrender.com/ws';

  console.log('[WS] connecting to:', url, 'env:', process.env.NODE_ENV);
  return new WebSocket(url);
};