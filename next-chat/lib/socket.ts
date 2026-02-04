export const createWebSocket = () => {
    return new WebSocket("ws://localhost:3030/ws");
};