"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seenHandler = void 0;
const message_receipts_js_1 = require("../api/message-receipts.js");
const broadcast_js_1 = require("../utils/broadcast.js");
const connectionStore_js_1 = require("../ws/connectionStore.js");
const seenHandler = async (ws, msg) => {
    const meta = (0, connectionStore_js_1.getMetaBySocket)(ws);
    if (!meta) {
        console.log('Missing meta!');
        return;
    }
    const result = await (0, message_receipts_js_1.markSeenUpToMessage)(msg.channelId, meta.userId, msg.lastMessageId);
    if (!result) {
        console.log('Result in null -> Nothing updated OR result.seenAt is undefined!');
        return;
    }
    // 1. Update unread only for this user
    const unread = await (0, message_receipts_js_1.getUnreadCountsByUser)(meta.userId);
    const unreadSnapshotMsg = {
        type: 'unread_snapshot',
        unread
    };
    (0, broadcast_js_1.sendToUser)(meta.userId, unreadSnapshotMsg);
    const seenUpdateEvent = {
        type: 'seen_update',
        messageIds: result.messageIds,
        userId: meta.userId,
        channelId: msg.channelId,
        seenAt: result.seenAt
    };
    (0, broadcast_js_1.broadcastToChannel)(msg.channelId, seenUpdateEvent);
};
exports.seenHandler = seenHandler;
