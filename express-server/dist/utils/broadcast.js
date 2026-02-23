"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToUser = exports.broadcastAll = exports.sendChatHistoryToClient = exports.broadcastToChannel = void 0;
const ws_1 = require("ws");
const app_1 = require("../app");
const connectionStore_1 = require("../ws/connectionStore");
// --- Broadcast helpers ---
const broadcastToChannel = (channelId, msg) => {
    const clients = (0, connectionStore_1.getSocketsByChannel)(channelId);
    const data = JSON.stringify(msg);
    clients.forEach((client) => {
        if (client.readyState === ws_1.WebSocket.OPEN) {
            client.send(data);
        }
    });
};
exports.broadcastToChannel = broadcastToChannel;
const sendChatHistoryToClient = (ws, history) => {
    ws.send(JSON.stringify(history));
};
exports.sendChatHistoryToClient = sendChatHistoryToClient;
const broadcastAll = (msg) => {
    const data = JSON.stringify(msg);
    app_1.wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
            client.send(data);
        }
    });
};
exports.broadcastAll = broadcastAll;
const sendToUser = (userId, event) => {
    const sockets = (0, connectionStore_1.getSocketsByUserId)(userId);
    if (!sockets) {
        console.log('User sockets SET is undefined!');
        return;
    }
    const data = JSON.stringify(event);
    sockets.forEach(ws => {
        if (ws.readyState === ws_1.WebSocket.OPEN) {
            ws.send(data);
        }
    });
};
exports.sendToUser = sendToUser;
