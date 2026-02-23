"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageRouter = messageRouter;
const join_handler_js_1 = require("./handlers/join.handler.js");
const chat_handler_js_1 = require("./handlers/chat.handler.js");
const seen_handler_js_1 = require("./handlers/seen.handler.js");
async function messageRouter(ws, msg, session) {
    switch (msg.type) {
        // --- Handle join ---
        case 'join': {
            return (0, join_handler_js_1.joinHandler)(ws, msg, session);
        }
        // --- Handle chat ---
        case 'chat': {
            return (0, chat_handler_js_1.chatHandler)(ws, msg);
        }
        // --- Handle seen ---
        case 'seen': {
            return (0, seen_handler_js_1.seenHandler)(ws, msg);
        }
        default: {
            console.log('Unknown message type!');
            const sysMsg = {
                type: 'system',
                content: `Unknown message type: ${msg}`
            };
            ws.send(JSON.stringify(sysMsg));
        }
    }
}
