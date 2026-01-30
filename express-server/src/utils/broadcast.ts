import { wss } from "../app";
import { MessageType } from "../types/ws-types";

// Broadcast to everyone

function broadcast(message: MessageType) {
    const data = JSON.stringify(message)
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data)
        }
    })
}

export {
    broadcast
}