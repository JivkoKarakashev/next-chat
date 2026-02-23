export const createWebSocket = () => {
    // return new WebSocket("ws://localhost:3030/ws");
    // console.log(process.env.NEXT_PUBLIC_WS_URL);
    return new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}`);
};