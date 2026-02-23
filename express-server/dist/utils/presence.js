"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitPresence = void 0;
const ws_1 = require("ws");
const connectionStore_1 = require("../ws/connectionStore");
// Emit a presence event to all clients in a channel
const emitPresence = (msg) => {
    const clients = (0, connectionStore_1.getSocketsByChannel)(msg.channelId);
    clients.forEach((ws) => {
        if (ws.readyState === ws_1.WebSocket.OPEN) {
            ws.send(JSON.stringify(msg));
        }
    });
};
exports.emitPresence = emitPresence;
