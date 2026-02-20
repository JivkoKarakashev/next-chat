import { WS, WSChannelCreatedEvent, WSHistoryEvent, WSPresenceEvent, WSSeenUpdateEvent, WSUnreadSnapshotEvent, WSUserActiveChannel } from '../ws/ws-server-types';
import { WSJoinRequest } from '../ws/ws-client-types';
import { ClientMeta, addChannelSocket, getMetaBySocket, setUserActiveChannel, switchChannelById } from '../ws/connectionStore';
import { addUserToChannel, getChatHistoryByChannel, getOrCreateChannelByName } from '../api/chat';
import { emitPresence } from '../utils/presence';
import { broadcastAll, broadcastToChannel, sendChatHistoryToClient, sendToUser } from '../utils/broadcast';
import { Session } from '../utils/validateSession';
import { markSeenUpToMessage } from '../api/message-receipts';
import { getUnreadCountsByUser } from '../api/message-receipts';

const joinHandler = async (ws: WS, msg: WSJoinRequest, session: Session) => {
  // Fetch channel
  const { channel, created } = await getOrCreateChannelByName(msg.channelName);
  // console.log('Join Message: ', msg);
  // console.log('Join Channel: ', channel);

  if (!channel) {
    console.log('Failed to join channel!');
    return;
  }

  if (created) {
    const createdChEvent: WSChannelCreatedEvent = {
      type: 'channel_created',
      channel
    };
    broadcastAll(createdChEvent);
  }

  // Update meta and leave previous channel
  const meta = getMetaBySocket(ws);

  if (meta && meta.channelId !== channel.channelId) {
    // Emit leave presence for previous channel
    const leaveEvent: WSPresenceEvent = {
      type: 'presence',
      event: 'leave',
      userId: session.userId,
      username: session.username,
      channelId: meta.channelId,
      channelName: meta.channelName
    };
    emitPresence(leaveEvent);

    // Switch to new channel
    switchChannelById(ws, channel.channelId, channel.channelName);
  } else {
    // First time joining
    const newMeta: ClientMeta = {
      userId: session.userId,
      username: session.username,
      channelId: channel.channelId,
      channelName: channel.channelName
    };
    addChannelSocket(ws, newMeta);
  }
  await addUserToChannel(channel.channelId, session.userId);

  // Fetch chat history from DB
  const dbHistory = await getChatHistoryByChannel(channel.channelId);

  // Send history to client
  const historyEvent: WSHistoryEvent = {
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

  sendChatHistoryToClient(ws, historyEvent);

  // --- Mark all messages as seen ---
  if (dbHistory.length > 0) {
    const lastMessage = dbHistory[dbHistory.length - 1];
    if (!lastMessage) {
      console.log('lastMessage is undefined!');
      return;
    }

    const result = await markSeenUpToMessage(
      channel.channelId,
      session.userId,
      lastMessage.publicId
    );

    if (result?.messageIds && result.messageIds.length > 0) {
      // 1. Broadcast seen update
      const seenEvent: WSSeenUpdateEvent = {
        type: 'seen_update',
        channelId: channel.channelId,
        userId: session.userId,
        messageIds: result.messageIds,
        seenAt: result.seenAt
      };
      broadcastToChannel(channel.channelId, seenEvent);

      // 2. Send updated unread snapshot to this user only
      const unread = await getUnreadCountsByUser(session.userId);

      const unreadSnapshotEvent: WSUnreadSnapshotEvent = {
        type: 'unread_snapshot',
        unread
      };
      sendToUser(session.userId, unreadSnapshotEvent);
    }
  }

  // Emit presence join to other clients
  const presenceEvent: WSPresenceEvent = {
    type: 'presence',
    event: 'join',
    userId: session.userId,
    username: session.username,
    channelId: channel.channelId,
    channelName: channel.channelName
  };
  emitPresence(presenceEvent);

  setUserActiveChannel(session.userId, channel.channelId);
  const userActiveChannelEvent: WSUserActiveChannel = {
    type: 'user_active_channel',
    userId: session.userId,
    channelId: channel.channelId
  };
  broadcastAll(userActiveChannelEvent);

  // console.log('User joined channel:', channel.channelName);
};

export {
  joinHandler
}