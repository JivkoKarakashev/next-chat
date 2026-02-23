"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seenHandler = void 0;
const message_receipts_1 = require("../api/message-receipts");
const broadcast_1 = require("../utils/broadcast");
const connectionStore_1 = require("../ws/connectionStore");
const seenHandler = async (ws, msg) => {
    const meta = (0, connectionStore_1.getMetaBySocket)(ws);
    if (!meta) {
        console.log('Missing meta!');
        return;
    }
    const result = await (0, message_receipts_1.markSeenUpToMessage)(msg.channelId, meta.userId, msg.lastMessageId);
    if (!result) {
        console.log('Result in null -> Nothing updated OR result.seenAt is undefined!');
        return;
    }
    // 1. Update unread only for this user
    const unread = await (0, message_receipts_1.getUnreadCountsByUser)(meta.userId);
    const unreadSnapshotMsg = {
        type: 'unread_snapshot',
        unread
    };
    (0, broadcast_1.sendToUser)(meta.userId, unreadSnapshotMsg);
    const seenUpdateEvent = {
        type: 'seen_update',
        messageIds: result.messageIds,
        userId: meta.userId,
        channelId: msg.channelId,
        seenAt: result.seenAt
    };
    (0, broadcast_1.broadcastToChannel)(msg.channelId, seenUpdateEvent);
};
exports.seenHandler = seenHandler;
