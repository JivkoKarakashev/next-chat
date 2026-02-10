import { JoinType, ChatType, SystemType, CreatedChannelType, WS, PresenceType } from '../ws/types';
import { ClientMeta, addChannelSocket, getMetaBySocket, switchChannelById } from '../ws/connectionStore';
import { getOrCreateChannelByName, getChatHistoryByChannel } from '../api/chat';
import { emitPresence } from '../utils/presence';
import { sendChatHistoryToClient } from '../utils/broadcast';
import { Session } from '../utils/validateSession';

const joinHandler = async (ws: WS, joinMsg: JoinType, session: Session) => {
  if (!joinMsg.channelName) {
    const sysMsg: SystemType = {
      type: 'system',
      userId: 'system',
      content: 'No channel selected!',
      event: null,
      channelName: null
    };
    return ws.send(JSON.stringify(sysMsg));
  }

  const meta = getMetaBySocket(ws);

  if (meta && meta.channelName === joinMsg.channelName) {
    const sysMsg: SystemType = {
      type: 'system',
      userId: 'system',
      content: 'Already in this channel!',
      event: null,
      channelName: meta.channelName
    };
    return ws.send(JSON.stringify(sysMsg));
  }

  const { channel, created } = await getOrCreateChannelByName(joinMsg.channelName);

  if (!channel) {
    console.log('Failed to join channel!');
    return;
  }

  if (created) {
    const createdChMsg: CreatedChannelType = {
      type: 'channel_created',
      userId: 'system',
      channel
    };
    ws.send(JSON.stringify(createdChMsg));
  }

  // leave previous channel - EMIT LEAVE FIRST
  if (meta) {
    const presenceMsg: PresenceType = {
      type: 'presence',
      event: 'leave',
      userId: session.userId,
      username: session.username,
      channelId: meta.channelId,
      channelName: meta.channelName
    };
    emitPresence(presenceMsg);
    // join new channel - SWITCH CHANNEL
    switchChannelById(ws, channel.channelId, channel.channelName);
  } else {
    const newMeta: ClientMeta = {
      userId: session.userId,
      username: session.username,
      channelId: channel.channelId,
      channelName: channel.channelName
    }
    addChannelSocket(ws, newMeta);
  }

  const dbHistory = await getChatHistoryByChannel(channel.channelId);
  const history: ChatType[] = dbHistory.map(msg => {
    return {
      ...{ ...msg, type: 'chat' },
      channelName: channel.channelName,
      event: null
    }
  });
  sendChatHistoryToClient(ws, history, channel.channelName);
  const presenceMsg: PresenceType = {
    type: 'presence',
    event: 'join',
    userId: session.userId,
    username: session.username,
    channelId: channel.channelId,
    channelName: channel.channelName
  };
  emitPresence(presenceMsg);
  console.log('User joined channel:', channel.channelName);
};

export {
  joinHandler
}