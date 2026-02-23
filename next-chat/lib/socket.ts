export const createWebSocket = () => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL!;
    return new WebSocket(wsUrl);
};