import http from "node:http";
import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";

import config from "./config";
import { env } from "./env";
import { WS, WSActiveChannelsSnapshot, WSAuthEvent, WSChannelsSnapshotEvent, WSOnlineUserSnapshot, WSPresenceEvent, WSUnreadSnapshotEvent, WSUserActiveChannel, WSUserPresenceEvent } from "./ws/ws-server-types";
import { WSClientEvent } from "./ws/ws-client-types";
import { addUserSocket, getActiveChannelsSnapshot, getOnlineUserIds, removeChannelSocket, removeUserSocket } from "./ws/connectionStore";
import { emitPresence } from "./utils/presence";
import { Session, validateSession } from "./utils/validateSession";
import { getAllChannels } from "./api/chat";
import { messageRouter } from "./router";
import { getUnreadCountsByUser } from "./api/message-receipts";
import { broadcastAll } from "./utils/broadcast";
import { userCreatedHandler } from "./api/user-created";
import { requireXInternalSecret } from "./middleware/internal-secret";
import { usersHandler } from "./api/users-handler";
import { channelsHandler } from "./api/channels-handler";


/* --- Express + WebSocket setup --- */
const app = express();
app.use(cors());
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

server.on('upgrade', (_request, _socket, _head) => {
  // console.log('Upgrade request for:', request.url);
});

wss.on('connection', async (ws: WS, req) => {
  console.log('New WebSocket connection!');
  // Parse session token from query
  const url = new URL(req.url!, `http://${req.headers.host}`);
  const sessionId = url.searchParams.get('session');

  let session: Session | undefined;

  /* --- HEARTBEAT STATE --- */
  let isAlive = true;

  ws.on('pong', () => {
    isAlive = true;
  });

  try {
    if (!sessionId) {
      return ws.close(1008, 'No session!');
    }

    session = await validateSession(sessionId);
    if (!session) {
      return ws.close(1008, 'Invalid session!');
    }
    // console.log(session);

    const bacameOnline = addUserSocket(session.userId, ws);
    if (bacameOnline) {
      const usrPresenceMsg: WSUserPresenceEvent = {
        type: 'user_presence',
        userId: session.userId,
        online: true
      };
      broadcastAll(usrPresenceMsg);
    }

    // console.log('User is ready.');
    // console.log('Sent auth confirmation to client.');

    /* --- AUTH CONFIRMATION --- */
    const authMsg: WSAuthEvent = {
      type: 'auth',
      content: 'success'
    };
    ws.send(JSON.stringify(authMsg));

    /* --- ONLINE USERS SNAPSHOT --- */
    const onlineUsrSnapshotMsg: WSOnlineUserSnapshot = {
      type: 'online_snapshot',
      users: getOnlineUserIds()
    };
    ws.send(JSON.stringify(onlineUsrSnapshotMsg));

    /* --- UNREAD SNAPSHOT --- */
    const unread = await getUnreadCountsByUser(session.userId);
    const unreadSnapshotMsg: WSUnreadSnapshotEvent = {
      type: 'unread_snapshot',
      unread
    };
    ws.send(JSON.stringify(unreadSnapshotMsg));

    /* --- CHANNELS SNAPSHOT --- */
    const channels = await getAllChannels();
    const chSnapshotMsg: WSChannelsSnapshotEvent = {
      type: 'channels_snapshot',
      channels
    };
    ws.send(JSON.stringify(chSnapshotMsg));

    /* --- ACTIVE CHANNELS SNAPSHOT --- */
    const data = getActiveChannelsSnapshot();
    const activeChSnapshotMsg: WSActiveChannelsSnapshot = {
      type: 'active_channel_snapshot',
      data
    };
    ws.send(JSON.stringify(activeChSnapshotMsg));
  } catch (err) {
    console.error('Connection error:', err);
    ws.close(1011); // Internal Error
  }

  /* --- HEARTBEAT INTERVAL (Ping/Pong) --- */
  const heartbeatInterval = setInterval(() => {
    if (ws.readyState !== ws.OPEN) {
      return;
    }

    if (!isAlive) {
      console.log('Terminating stale connection!');
      return ws.terminate();
    }

    isAlive = false;
    ws.ping();
  }, env.HEARTBEAT_INTERVAL);

  /* --- SESSION VALIDATION INTERVAL --- */
  const sessionValidationInterval = setInterval(async () => {
    if (ws.readyState !== ws.OPEN) {
      return;
    }

    const valid = await validateSession(sessionId!);
    if (!valid) {
      console.log('Session expired — closing socket!');
      ws.close(1008, 'Session expired!');
    }
  }, env.HEARTBEAT_INTERVAL);

  /* --- MESSAGE HANDLER --- */
  ws.on('message', async (data) => {
    if (!session) {
      console.log('Message ignored: User not authenticated yet!');
      return;
    }
    // console.log('MESSAGE EVENT FIRED for user:', session.username);
    // console.log('RAW:', data.toString());
    let msg: WSClientEvent;
    try {
      msg = JSON.parse(data.toString());
    } catch {
      console.log('Error occurred on message parse!');
      return;
    }

    await messageRouter(ws, msg, session);
  });

  /* --- CLOSE HANDLER --- */
  ws.on('close', () => {
    clearInterval(heartbeatInterval);
    clearInterval(sessionValidationInterval);

    if (!session) {
      return ws.close(1008, 'Invalid session!');
    }

    const meta = removeChannelSocket(ws);
    if (meta) {
      const presenceMsg: WSPresenceEvent = {
        type: 'presence',
        event: 'leave',
        userId: meta.userId,
        username: meta.username,
        channelId: meta.channelId,
        channelName: meta.channelName
      };
      emitPresence(presenceMsg);
    }

    const wentOffline = removeUserSocket(session.userId, ws);
    if (wentOffline) {
      const usrActiveChEvent: WSUserActiveChannel = {
        type: 'user_active_channel',
        userId: session.userId,
        channelId: null
      };
      broadcastAll(usrActiveChEvent);

      const usrPresenceMsg: WSUserPresenceEvent = {
        type: 'user_presence',
        userId: session.userId,
        online: false
      };
      broadcastAll(usrPresenceMsg);
    }
  });

  ws.on('error', (err) => {
    console.error('WebSocket error: ', err);
  });
});

app.use(express.json());
app.get('/internal/health', (_req, res) => res.json({ ok: true, environment: config.env }));
app.get('/internal/channels', requireXInternalSecret, channelsHandler);
app.get('/internal/users', requireXInternalSecret, usersHandler);
app.post('/internal/user-created', requireXInternalSecret, userCreatedHandler);

server.listen(config.port || process.env.LISTENING_PORT || 3030, () => {
  console.log(`HTTP + WS server listening on port ${config.port} [env: ${config.env}]`);
});

export {
  app,
  wss
}