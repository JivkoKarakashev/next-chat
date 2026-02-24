export const createWebSocket = () => {
  // const wsUrl = process.env.NEXT_PUBLIC_WS_URL!;
  // return new WebSocket(wsUrl);
  const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  return new WebSocket(`${protocol}://${location.host}/ws`);
};