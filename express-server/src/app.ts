import http from "node:http";
import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import * as cookies from "cookie";

import config from "./config";
import { WSActiveChannelsSnapshot, WSAuthEvent, WSChannelsSnapshotEvent, WSOnlineUserSnapshot, WSPresenceEvent, WSUnreadSnapshotEvent, WSUserActiveChannel, WSUserPresenceEvent } from "./ws/ws-server-types";
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

  try {
    const cookie = cookies.parse(req.headers.cookie ?? "");
    const sessionId = cookie.session;
    if (!sessionId) {
      return ws.close(1008, 'No session!');
    }

    session = await validateSession(sessionId);
    if (!session) {
      return ws.close(1008, 'Invalid session!');
    }

    const bacameOnline = addUserSocket(session.userId, ws);
    if (bacameOnline) {
      const usrPresenceMsg: WSUserPresenceEvent = {
        type: 'user_presence',
        userId: session.userId,
        online: true
      };
      broadcastAll(usrPresenceMsg);
    }

    console.log('User is ready.');
    console.log('Sent auth confirmation to client.');
    // AUTH CONFIRMATION
    const authMsg: WSAuthEvent = {
      type: 'auth',
      content: 'success'
    };
    ws.send(JSON.stringify(authMsg));

    //  ONLINE USERS SNAPSHOT
    const onlineUsrSnapshotMsg: WSOnlineUserSnapshot = {
      type: 'online_snapshot',
      users: getOnlineUserIds()
    };
    ws.send(JSON.stringify(onlineUsrSnapshotMsg));

    // UNREAD SNAPSHOT
    const unread = await getUnreadCountsByUser(session.userId);
    const unreadSnapshotMsg: WSUnreadSnapshotEvent = {
      type: 'unread_snapshot',
      unread
    };
    ws.send(JSON.stringify(unreadSnapshotMsg));

    // SEND CHANNELS SNAPSHOT
    const channels = await getAllChannels();
    const chSnapshotMsg: WSChannelsSnapshotEvent = {
      type: 'channels_snapshot',
      channels
    };
    ws.send(JSON.stringify(chSnapshotMsg));

    // SEND ACTIVE CHANNELS SNAPSHOT
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
  // console.log(session);

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

  ws.on('close', () => {
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