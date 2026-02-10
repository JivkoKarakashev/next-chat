import http from "node:http";
import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import * as cookies from "cookie";

import config from "./config";
import { MessageType, SystemType, ChannelsSnapshotType, PresenceType } from "./ws/types";
import { addUserSocket, removeChannelSocket, removeUserSocket } from "./ws/connectionStore";
import { emitPresence, emitUserOnline, emitUserOffline } from "./utils/presence";
import { Session, validateSession } from "./utils/validateSession";
import { getAllChannels } from "./api/chat";
import { messageRouter } from "./router";


// --- Express + WebSocket setup ---
const app = express();
app.use(cors());
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

server.on('upgrade', (request, _socket, _head) => {
  console.log('Upgrade request for:', request.url);
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
    // console.log('MESSAGE EVENT FIRED for user:', session.username);
    // console.log('RAW:', data.toString());
    try {
      msg = JSON.parse(data.toString());
    } catch {
      console.log('Error occurred on message parse!');
      return;
    }

    await messageRouter(ws, msg, session);
  });

  ws.on('close', () => {
    if (!session) {
      return ws.close(1008, 'Session invalid or expired!');
    }
    const meta = removeChannelSocket(ws);
    if (meta) {
      const presenceMsg: PresenceType = {
        type: 'presence',
        event: 'leave',
        userId: meta.userId,
        username: meta.username,
        channelId: meta.channelId,
        channelName: meta.channelName
      };
      emitPresence(presenceMsg);
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