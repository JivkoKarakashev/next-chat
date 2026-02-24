"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wss = exports.app = void 0;
const node_http_1 = __importDefault(require("node:http"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const ws_1 = require("ws");
const config_1 = __importDefault(require("./config"));
const connectionStore_1 = require("./ws/connectionStore");
const presence_1 = require("./utils/presence");
const validateSession_1 = require("./utils/validateSession");
const chat_1 = require("./api/chat");
const router_1 = require("./router");
const message_receipts_1 = require("./api/message-receipts");
const broadcast_1 = require("./utils/broadcast");
const user_created_1 = require("./api/user-created");
const internal_secret_1 = require("./middleware/internal-secret");
const users_handler_1 = require("./api/users-handler");
const channels_handler_1 = require("./api/channels-handler");
// --- Express + WebSocket setup ---
const app = (0, express_1.default)();
exports.app = app;
app.use((0, cors_1.default)());
const server = node_http_1.default.createServer(app);
const wss = new ws_1.WebSocketServer({ server, path: '/ws' });
exports.wss = wss;
server.on('upgrade', (request, _socket, _head) => {
    console.log('Upgrade request for:', request.url);
});
wss.on('connection', async (ws, req) => {
    console.log('New WebSocket connection!');
    // Parse session token from query
    const url = new URL(req.url, `http://${req.headers.host}`);
    const sessionId = url.searchParams.get('session');
    let session;
    try {
        if (!sessionId) {
            return ws.close(1008, 'No session!');
        }
        session = await (0, validateSession_1.validateSession)(sessionId);
        if (!session) {
            return ws.close(1008, 'Invalid session!');
        }
        // ws.session = sessionId;
        const bacameOnline = (0, connectionStore_1.addUserSocket)(session.userId, ws);
        if (bacameOnline) {
            const usrPresenceMsg = {
                type: 'user_presence',
                userId: session.userId,
                online: true
            };
            (0, broadcast_1.broadcastAll)(usrPresenceMsg);
        }
        console.log('User is ready.');
        console.log('Sent auth confirmation to client.');
        // AUTH CONFIRMATION
        const authMsg = {
            type: 'auth',
            content: 'success'
        };
        ws.send(JSON.stringify(authMsg));
        //  ONLINE USERS SNAPSHOT
        const onlineUsrSnapshotMsg = {
            type: 'online_snapshot',
            users: (0, connectionStore_1.getOnlineUserIds)()
        };
        ws.send(JSON.stringify(onlineUsrSnapshotMsg));
        // UNREAD SNAPSHOT
        const unread = await (0, message_receipts_1.getUnreadCountsByUser)(session.userId);
        const unreadSnapshotMsg = {
            type: 'unread_snapshot',
            unread
        };
        ws.send(JSON.stringify(unreadSnapshotMsg));
        // SEND CHANNELS SNAPSHOT
        const channels = await (0, chat_1.getAllChannels)();
        const chSnapshotMsg = {
            type: 'channels_snapshot',
            channels
        };
        ws.send(JSON.stringify(chSnapshotMsg));
        // SEND ACTIVE CHANNELS SNAPSHOT
        const data = (0, connectionStore_1.getActiveChannelsSnapshot)();
        const activeChSnapshotMsg = {
            type: 'active_channel_snapshot',
            data
        };
        ws.send(JSON.stringify(activeChSnapshotMsg));
    }
    catch (err) {
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
        let msg;
        try {
            msg = JSON.parse(data.toString());
        }
        catch {
            console.log('Error occurred on message parse!');
            return;
        }
        await (0, router_1.messageRouter)(ws, msg, session);
    });
    ws.on('close', () => {
        if (!session) {
            return ws.close(1008, 'Invalid session!');
        }
        const meta = (0, connectionStore_1.removeChannelSocket)(ws);
        if (meta) {
            const presenceMsg = {
                type: 'presence',
                event: 'leave',
                userId: meta.userId,
                username: meta.username,
                channelId: meta.channelId,
                channelName: meta.channelName
            };
            (0, presence_1.emitPresence)(presenceMsg);
        }
        const wentOffline = (0, connectionStore_1.removeUserSocket)(session.userId, ws);
        if (wentOffline) {
            const usrActiveChEvent = {
                type: 'user_active_channel',
                userId: session.userId,
                channelId: null
            };
            (0, broadcast_1.broadcastAll)(usrActiveChEvent);
            const usrPresenceMsg = {
                type: 'user_presence',
                userId: session.userId,
                online: false
            };
            (0, broadcast_1.broadcastAll)(usrPresenceMsg);
        }
    });
});
app.use(express_1.default.json());
app.get('/internal/health', (_req, res) => res.json({ ok: true, environment: config_1.default.env }));
app.get('/internal/channels', internal_secret_1.requireXInternalSecret, channels_handler_1.channelsHandler);
app.get('/internal/users', internal_secret_1.requireXInternalSecret, users_handler_1.usersHandler);
app.post('/internal/user-created', internal_secret_1.requireXInternalSecret, user_created_1.userCreatedHandler);
server.listen(config_1.default.port || process.env.LISTENING_PORT || 3030, () => {
    console.log(`HTTP + WS server listening on port ${config_1.default.port} [env: ${config_1.default.env}]`);
});
