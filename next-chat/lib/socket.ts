export const createWebSocket = () => {
    // return new WebSocket("ws://localhost:3030/ws");
    return new WebSocket(`${process.env.WS_URL}`);
};