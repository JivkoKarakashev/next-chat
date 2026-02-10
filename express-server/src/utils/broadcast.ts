import { WebSocket as WSRuntime } from 'ws';
import { wss } from '../app';

import { WS, ChatType, HistoryType } from "../ws/types";
import { getSocketsByChannel } from "../ws/connectionStore";

// --- Broadcast helpers ---
const sendMessageByChannel = (channelId: string, message: ChatType): void => {
  const clients = getSocketsByChannel(channelId);
  const data = JSON.stringify(message);
  clients.forEach((client: WS) => {
    if (client.readyState === WSRuntime.OPEN) {
      client.send(data);
    }
  });
};

const sendChatHistoryToClient = (ws: WS, history: ChatType[], channelName: string): void => {
  const historyMsg: HistoryType = {
    userId: 'history',
    type: 'history',
    channelName,
    content: history,
    event: null
  };
  ws.send(JSON.stringify(historyMsg));
};

const broadcastAll = (data: string) => {
  wss.clients.forEach((client: WS) => {
    if (client.readyState === client.OPEN) {
      client.send(data);
    }
  });
};

export {
  sendMessageByChannel,
  sendChatHistoryToClient,
  broadcastAll
}