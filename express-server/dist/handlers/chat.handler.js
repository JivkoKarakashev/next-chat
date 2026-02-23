"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatHandler = void 0;
const connectionStore_1 = require("../ws/connectionStore");
const chat_1 = require("../api/chat");
const broadcast_1 = require("../utils/broadcast");
const message_receipts_1 = require("../api/message-receipts");
const chatHandler = async (ws, msg) => {
    const meta = (0, connectionStore_1.getMetaBySocket)(ws);
    // console.log(meta);
    if (!meta) {
        console.log('Missing meta!');
        return;
    }
    if (!msg.content) {
        console.log('Message with empty content!');
        return;
    }
    // 1. Save message to DB
    const msgArgs = {
        type: msg.type,
        userId: meta.userId,
        channelId: meta.channelId,
        content: msg.content
    };
    // console.log('Message Args:', msgArgs);
    const savedMsg = await (0, chat_1.insertMessage)(msgArgs);
    // console.log(savedMsg);
    if (!savedMsg) {
        // console.log('An error occurred while inserting a new message in the database!');
        return;
    }
    // 2. Create receipts for ALL members
    await (0, message_receipts_1.insertMessageReceipts)(savedMsg.internalId, meta.channelId);
    // 3. Get live users in channel
    const sockets = [...(0, connectionStore_1.getSocketsByChannel)(meta.channelId)];
    const liveUserIds = sockets.map(s => (0, connectionStore_1.getMetaBySocket)(s)?.userId).filter((uid) => !!uid);
    // console.log(liveUserIds);
    // 4. Mark delivered for live users
    await (0, message_receipts_1.markDeliveredForUsers)(savedMsg.internalId, liveUserIds);
    // 5. Fetch full receipt snapshot from DB
    const receipts = await (0, message_receipts_1.getReceiptSnapshot)(savedMsg.publicId);
    // Broadcast to all clients in the channel
    const chatEvent = {
        type: 'chat',
        id: savedMsg.publicId,
        userId: meta.userId,
        username: meta.username,
        channelId: meta.channelId,
        channelName: meta.channelName,
        content: savedMsg.content,
        createdAt: savedMsg.createdAt,
        updatedAt: savedMsg.updatedAt,
        receipts
    };
    (0, broadcast_1.broadcastToChannel)(meta.channelId, chatEvent);
    // Update unread counters for ALL members except sender
    const allUserIds = await (0, chat_1.getUserIdsByChannel)(meta.channelId);
    for (const userId of allUserIds) {
        if (userId === meta.userId) {
            continue; // sender should not increase unread
        }
        const unread = await (0, message_receipts_1.getUnreadCountsByUser)(userId);
        const unreadSnapshot = {
            type: 'unread_snapshot',
            unread
        };
        (0, broadcast_1.sendToUser)(userId, unreadSnapshot);
    }
};
exports.chatHandler = chatHandler;
