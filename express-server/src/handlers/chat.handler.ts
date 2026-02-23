import { WS, WSChatEvent, WSUnreadSnapshotEvent } from '../ws/ws-server-types.js';
import { getMetaBySocket, getSocketsByChannel } from '../ws/connectionStore.js';
import { InsertMessageArgs, getUserIdsByChannel, insertMessage } from '../api/chat.js';
import { broadcastToChannel, sendToUser } from '../utils/broadcast.js';
import { WSChatRequest } from '../ws/ws-client-types.js';
import { getReceiptSnapshot, getUnreadCountsByUser, insertMessageReceipts, markDeliveredForUsers } from '../api/message-receipts.js';

const chatHandler = async (ws: WS, msg: WSChatRequest) => {
  const meta = getMetaBySocket(ws);
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
  const msgArgs: InsertMessageArgs = {
    type: msg.type,
    userId: meta.userId,
    channelId: meta.channelId,
    content: msg.content
  };
  // console.log('Message Args:', msgArgs);
  const savedMsg = await insertMessage(msgArgs);
  // console.log(savedMsg);
  if (!savedMsg) {
    // console.log('An error occurred while inserting a new message in the database!');
    return;
  }

  // 2. Create receipts for ALL members
  await insertMessageReceipts(savedMsg.internalId, meta.channelId);

  // 3. Get live users in channel
  const sockets = [...getSocketsByChannel(meta.channelId)];
  const liveUserIds: string[] = sockets.map(s => getMetaBySocket(s)?.userId).filter((uid): uid is string => !!uid);
  // console.log(liveUserIds);

  // 4. Mark delivered for live users
  await markDeliveredForUsers(savedMsg.internalId, liveUserIds);

  // 5. Fetch full receipt snapshot from DB
  const receipts = await getReceiptSnapshot(savedMsg.publicId);

  // Broadcast to all clients in the channel
  const chatEvent: WSChatEvent = {
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
  broadcastToChannel(meta.channelId, chatEvent);

  // Update unread counters for ALL members except sender
  const allUserIds = await getUserIdsByChannel(meta.channelId);

  for (const userId of allUserIds) {
    if (userId === meta.userId) {
      continue; // sender should not increase unread
    }

    const unread = await getUnreadCountsByUser(userId);

    const unreadSnapshot: WSUnreadSnapshotEvent = {
      type: 'unread_snapshot',
      unread
    };
    sendToUser(userId, unreadSnapshot);
  }

};

export {
  chatHandler
}