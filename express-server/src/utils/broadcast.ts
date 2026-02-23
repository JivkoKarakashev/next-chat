import { WebSocket as WSRuntime } from 'ws';

import { wss } from '../app';

import { WS, WSHistoryEvent, WSServerEvent } from "../ws/ws-server-types";
import { getSocketsByChannel, getSocketsByUserId } from '../ws/connectionStore';

// --- Broadcast helpers ---
const broadcastToChannel = (channelId: string, msg: WSServerEvent): void => {
  const clients = getSocketsByChannel(channelId);
  const data = JSON.stringify(msg);
  clients.forEach((client: WS) => {
    if (client.readyState === WSRuntime.OPEN) {
      client.send(data);
    }
  });
};

const sendChatHistoryToClient = (ws: WS, history: WSHistoryEvent): void => {
  ws.send(JSON.stringify(history));
};

const broadcastAll = (msg: WSServerEvent) => {
  const data = JSON.stringify(msg);
  wss.clients.forEach((client: WS) => {
    if (client.readyState === client.OPEN) {
      client.send(data);
    }
  });
};

const sendToUser = (userId: string, event: WSServerEvent) => {
  const sockets = getSocketsByUserId(userId);
  if (!sockets) {
    console.log('User sockets SET is undefined!');
    return;
  }

  const data = JSON.stringify(event);

  sockets.forEach(ws => {
    if (ws.readyState === WSRuntime.OPEN) {
      ws.send(data);
    }
  });
};

export {
  broadcastToChannel,
  sendChatHistoryToClient,
  broadcastAll,
  sendToUser
}