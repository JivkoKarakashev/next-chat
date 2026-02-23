"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinHandler = void 0;
const connectionStore_js_1 = require("../ws/connectionStore.js");
const chat_js_1 = require("../api/chat.js");
const presence_js_1 = require("../utils/presence.js");
const broadcast_js_1 = require("../utils/broadcast.js");
const message_receipts_js_1 = require("../api/message-receipts.js");
const message_receipts_js_2 = require("../api/message-receipts.js");
const joinHandler = async (ws, msg, session) => {
    // Fetch channel
    const { channel, created } = await (0, chat_js_1.getOrCreateChannelByName)(msg.channelName);
    // console.log('Join Message: ', msg);
    // console.log('Join Channel: ', channel);
    if (!channel) {
        console.log('Failed to join channel!');
        return;
    }
    if (created) {
        const createdChEvent = {
            type: 'channel_created',
            channel
        };
        (0, broadcast_js_1.broadcastAll)(createdChEvent);
    }
    // Update meta and leave previous channel
    const meta = (0, connectionStore_js_1.getMetaBySocket)(ws);
    if (meta && meta.channelId !== channel.channelId) {
        // Emit leave presence for previous channel
        const leaveEvent = {
            type: 'presence',
            event: 'leave',
            userId: session.userId,
            username: session.username,
            channelId: meta.channelId,
            channelName: meta.channelName
        };
        (0, presence_js_1.emitPresence)(leaveEvent);
        // Switch to new channel
        (0, connectionStore_js_1.switchChannelById)(ws, channel.channelId, channel.channelName);
    }
    else {
        // First time joining
        const newMeta = {
            userId: session.userId,
            username: session.username,
            channelId: channel.channelId,
            channelName: channel.channelName
        };
        (0, connectionStore_js_1.addChannelSocket)(ws, newMeta);
    }
    await (0, chat_js_1.addUserToChannel)(channel.channelId, session.userId);
    // Fetch chat history from DB
    const dbHistory = await (0, chat_js_1.getChatHistoryByChannel)(channel.channelId);
    // Send history to client
    const historyEvent = {
        type: 'history',
        channelId: channel.channelId,
        channelName: channel.channelName,
        messages: dbHistory.map(m => ({
            type: 'chat',
            id: m.publicId,
            userId: m.userId,
            username: m.username,
            channelId: m.channelId,
            channelName: channel.channelName,
            content: m.content,
            createdAt: m.createdAt,
            updatedAt: m.updatedAt,
            receipts: m.receipts
        }))
    };
    (0, broadcast_js_1.sendChatHistoryToClient)(ws, historyEvent);
    // --- Mark all messages as seen ---
    if (dbHistory.length > 0) {
        const lastMessage = dbHistory[dbHistory.length - 1];
        if (!lastMessage) {
            console.log('lastMessage is undefined!');
            return;
        }
        const result = await (0, message_receipts_js_1.markSeenUpToMessage)(channel.channelId, session.userId, lastMessage.publicId);
        if (result?.messageIds && result.messageIds.length > 0) {
            // 1. Broadcast seen update
            const seenEvent = {
                type: 'seen_update',
                channelId: channel.channelId,
                userId: session.userId,
                messageIds: result.messageIds,
                seenAt: result.seenAt
            };
            (0, broadcast_js_1.broadcastToChannel)(channel.channelId, seenEvent);
            // 2. Send updated unread snapshot to this user only
            const unread = await (0, message_receipts_js_2.getUnreadCountsByUser)(session.userId);
            const unreadSnapshotEvent = {
                type: 'unread_snapshot',
                unread
            };
            (0, broadcast_js_1.sendToUser)(session.userId, unreadSnapshotEvent);
        }
    }
    // Emit presence join to other clients
    const presenceEvent = {
        type: 'presence',
        event: 'join',
        userId: session.userId,
        username: session.username,
        channelId: channel.channelId,
        channelName: channel.channelName
    };
    (0, presence_js_1.emitPresence)(presenceEvent);
    (0, connectionStore_js_1.setUserActiveChannel)(session.userId, channel.channelId);
    const userActiveChannelEvent = {
        type: 'user_active_channel',
        userId: session.userId,
        channelId: channel.channelId
    };
    (0, broadcast_js_1.broadcastAll)(userActiveChannelEvent);
    // console.log('User joined channel:', channel.channelName);
};
exports.joinHandler = joinHandler;
