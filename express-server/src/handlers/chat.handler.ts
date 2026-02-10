import { ChatType, WS } from '../ws/types';
import { getMetaBySocket } from '../ws/connectionStore';
import { InsertMessageArgs, insertMessage } from '../api/chat';
import { sendMessageByChannel } from '../utils/broadcast';

const chatHandler = async (ws: WS, chatMsg: ChatType) => {
  const meta = getMetaBySocket(ws);
  // console.log(meta);
  if (!meta) {
    console.log('Join a channel first!');
    return;
  }

  if (!chatMsg.content) {
    console.log('Message with empty content is not allowed!');
    return;
  }

  // Save message to DB
  const msgArgs: InsertMessageArgs = {
    userId: meta.userId,
    channelId: meta.channelId,
    type: chatMsg.type,
    content: chatMsg.content
  };
  const savedMsg = await insertMessage(msgArgs);
  // console.log(savedMsg);
  if (!savedMsg) {
    console.log('Inserting message to database has been failed!');
    return;
  }

  // Broadcast to all clients in the channel
  const chtMsg: ChatType = {
    ...{ ...savedMsg, type: 'chat' },
    username: meta.username,
    channelName: meta.channelName
  };
  sendMessageByChannel(meta.channelId, chtMsg);
};

export {
  chatHandler
}