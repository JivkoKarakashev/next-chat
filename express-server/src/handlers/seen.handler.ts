import { WS, WSSeenUpdateEvent, WSUnreadSnapshotEvent } from '../ws/ws-server-types.js';
import { WSSeenRequest } from '../ws/ws-client-types.js';

import { getUnreadCountsByUser, markSeenUpToMessage } from '../api/message-receipts.js';
import { broadcastToChannel, sendToUser } from '../utils/broadcast.js';
import { getMetaBySocket } from '../ws/connectionStore.js';

const seenHandler = async (ws: WS, msg: WSSeenRequest) => {
  const meta = getMetaBySocket(ws);
  if (!meta) {
    console.log('Missing meta!');
    return;
  }

  const result = await markSeenUpToMessage(msg.channelId, meta.userId, msg.lastMessageId);

  if (!result) {
    console.log('Result in null -> Nothing updated OR result.seenAt is undefined!');
    return;
  }

  // 1. Update unread only for this user
  const unread = await getUnreadCountsByUser(meta.userId);
  const unreadSnapshotMsg: WSUnreadSnapshotEvent = {
    type: 'unread_snapshot',
    unread
  };
  sendToUser(meta.userId, unreadSnapshotMsg);

  const seenUpdateEvent: WSSeenUpdateEvent = {
    type: 'seen_update',
    messageIds: result.messageIds,
    userId: meta.userId,
    channelId: msg.channelId,
    seenAt: result.seenAt
  };

  broadcastToChannel(msg.channelId, seenUpdateEvent);
};

export {
  seenHandler
}