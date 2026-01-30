const createWebSocket = (): WebSocket => {
    const url =
        process.env.NODE_ENV === "production"
            ? `wss://${window.location.host}`
            : "ws://localhost:3030"

    return new WebSocket(url);
};

export {
    createWebSocket
}