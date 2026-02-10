import http from "node:http";
import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import * as cookies from "cookie";

import config from "./config";
import { ChatType, MessageType, SystemType, JoinType, CreatedChannelType, ChannelsSnapshotType } from "./ws/types";
import { addChannelSocket, addUserSocket, getMetaBySocket, removeChannelSocket, removeUserSocket, switchChannelById } from "./ws/connectionStore";
import { emitPresence, emitUserOnline, emitUserOffline } from "./utils/presence";
import { Session, validateSession } from "./utils/validateSession";
import { getAllChannels, getChatHistoryByChannel, getOrCreateChannelByName, insertMessage } from "./api/chat";
import { broadcastAll, sendChatHistoryToClient, sendMessageByChannel } from "./utils/broadcast";


// --- Express + WebSocket setup ---
const app = express();
app.use(cors());
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

server.on('upgrade', (request, _socket, _head) => {
  console.log('🚀 Upgrade request for:', request.url);
});

wss.on('connection', async (ws, req) => {
  console.log('New WebSocket connection!');
  let session: Session | undefined;
  (async () => {
    try {
      const cookie = cookies.parse(req.headers.cookie ?? "");
      const sessionId = cookie.session;
      if (!sessionId) {
        return ws.close(1008, 'No sessionId!');
      }

      session = await validateSession(sessionId);
      if (!session) {
        return ws.close(1008, 'Session invalid or expired!');
      }

      const emitOnline = addUserSocket(session.userId, ws);
      if (emitOnline) {
        emitUserOnline(session.userId);
      }
      console.log('User is ready.');
      console.log('Sent auth confirmation to client.');
      // AUTH CONFIRMATION
      const sysMsg: SystemType = {
        userId: 'system',
        type: 'system',
        event: null,
        channelName: null,
        content: 'authenticated'
      };
      ws.send(JSON.stringify(sysMsg));

      // SEND CHANNELS SNAPSHOT
      const channels = await getAllChannels();
      const chSnapMsg: ChannelsSnapshotType = {
        userId: 'system',
        type: 'channels_snapshot',
        channels
      };
      ws.send(JSON.stringify(chSnapMsg));
    } catch (err) {
      console.error('Connection error:', err);
      ws.close(1011); // Internal Error
    }
  })();
  // console.log(session);

  ws.on('message', async (data) => {
    let msg: MessageType;
    if (!session) {
      console.log('Message ignored: User not authenticated yet!');
      return;
    }
    console.log('MESSAGE EVENT FIRED for user:', session.username);
    console.log('RAW:', data.toString());
    try {
      msg = JSON.parse(data.toString());
    } catch {
      console.log('Error occurred on message parse!');
      return;
    }

    if (!msg || typeof msg.type !== 'string') {
      console.log('No message or wrong type!');
      return;
    }

    // --- Handle join ---
    if (msg.type === 'join') {
      if (!session) {
        return ws.close(1008, 'Session invalid or expired!');
      }
      const joinMsg = msg as JoinType;
      const meta = getMetaBySocket(ws);
      // console.log(joinMsg);
      // console.log(meta);
      if (!joinMsg.channelName) {
        ws.send(JSON.stringify({
          type: 'system',
          userId: 'system',
          content: 'No channel selected!',
          event: null,
          channelName: null
        }));
        return;
      }
      if (meta?.channelId && meta.channelName === joinMsg.channelName) {
        const sysMsg: SystemType = { userId: 'system', type: 'system', channelName: joinMsg.channelName, content: 'Already in this channel!', event: null };
        ws.send(JSON.stringify(sysMsg));
        return;
      }

      const { channel, created } = await getOrCreateChannelByName(joinMsg.channelName);
      if (!channel) {
        ws.send(JSON.stringify({
          type: 'system',
          message: 'Failed to join channel!'
        }));
        return;
      }
      if (created) {
        const channelCreatedMsg: CreatedChannelType = {
          userId: 'system',
          type: 'channel_created',
          channel
        };

        broadcastAll(JSON.stringify(channelCreatedMsg));
      }


      if (meta) {
        // EMIT LEAVE FIRST
        emitPresence({ event: 'leave', userId: session.userId, username: session.username, channelId: meta.channelId, channelName: meta.channelName });
        // SWITCH CHANNEL
        switchChannelById(ws, channel.channelId, channel.channelName);
      } else {
        addChannelSocket(ws, { userId: session.userId, username: session.username, channelId: channel.channelId, channelName: channel.channelName });
      }
      const dbHistory = await getChatHistoryByChannel(channel.channelId) ?? [];
      const chatHistory = dbHistory.map(msg => {
        return {
          ...msg,
          channelName: channel.channelName
        } as ChatType
      });
      sendChatHistoryToClient(ws, chatHistory, channel.channelName);
      emitPresence({ event: 'join', userId: session.userId, username: session.username, channelId: channel.channelId, channelName: joinMsg.channelName });
      console.log('User joined channel:', channel.channelName);
    }

    // --- Handle chat ---
    if (msg.type === 'chat') {
      const meta = getMetaBySocket(ws);
      // console.log(meta);
      if (!meta) {
        ws.send(JSON.stringify({ type: 'system', message: 'Join a channel first!' }));
        return;
      }

      const chatMsg = msg as ChatType;
      if (!chatMsg.content) {
        console.log('Message with empty content not Allowed!');
        return;
      }

      console.log(chatMsg);
      // Save to DB
      const savedMsg = await insertMessage({ userId: meta.userId, channelId: meta.channelId, type: chatMsg.type, content: chatMsg.content });
      if (!savedMsg) {
        console.log('Insert message Failed!');
        return;
      }

      // Broadcast to all clients in the channel
      sendMessageByChannel(savedMsg.channelId, {
        id: savedMsg.id,
        type: chatMsg.type,
        userId: savedMsg.userId,
        username: meta.username,
        channelId: savedMsg.channelId,
        channelName: meta.channelName,
        content: savedMsg.content,
        event: null,
        createdAt: savedMsg.createdAt,
        updatedAt: savedMsg.updatedAt
      });
    }
  });

  ws.on('close', () => {
    if (!session) {
      return ws.close(1008, 'Session invalid or expired!');
    }
    const meta = removeChannelSocket(ws);
    if (meta) {
      emitPresence({ event: 'leave', userId: session.userId, username: session.username, channelId: meta.channelId, channelName: meta.channelName });
    }

    const emitOffline = removeUserSocket(session.userId, ws);
    if (emitOffline) {
      emitUserOffline(session.userId);
    }
  });
});

app.use(express.json());
app.get('/health', (_req, res) => res.json({ ok: true, environment: config.env }));
app.get('/channels', async (_, res) => {
  const allChannels = await getAllChannels();
  // console.log(allChannels);
  res.json(allChannels);
});

if (config.env === 'development') {
  server.listen(config.port, () => {
    console.log(`HTTP + WS server listening on port ${config.port}`);
  });
}

export {
  app,
  wss
}