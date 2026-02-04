import http from "node:http";
import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import * as cookies from "cookie";

import config from "./config";
import { ChatType, MessageType, SystemType, JoinType } from "./ws/types";
import { addChannelSocket, addUserSocket, getMetaBySocket, removeChannelSocket, removeUserSocket, switchChannelById } from "./ws/connectionStore";
import { emitPresenceJoin, emitPresenceLeave, emitUserOnline, emitUserOffline } from "./utils/presence";
import { Session, validateSession } from "./utils/validateSession";
import { getChatHistoryByChannel, getOrCreateChannelByName, insertMessage } from "./api/chat";
import { sendChatHistoryToClient, sendMessageByChannel } from "./utils/broadcast";


// --- Express + WebSocket setup ---
const app = express();
app.use(cors());
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

server.on('upgrade', (request, _socket, _head) => {
    console.log('🚀 Upgrade request for:', request.url);
});

wss.on("connection", async (ws, req) => {
    console.log("✅ New WebSocket connection!");
    let session: Session | undefined;
    (async () => {
        try {
            const cookie = cookies.parse(req.headers.cookie ?? "");
            const sessionId = cookie.session;
            if (!sessionId) {
                return ws.close(1008, "No sessionId!");
            }

            session = await validateSession(sessionId);
            if (!session) {
                return ws.close(1008, "❌ Session invalid or expired!");
            }

            const emitOnline = addUserSocket(session.userId, ws);
            if (emitOnline) {
                emitUserOnline(session.userId);
            }
            console.log("✅ User is ready.");
            console.log("✅ Sent auth confirmation to client.");
            ws.send(JSON.stringify({ type: 'system', message: 'authenticated' }));
        } catch (error) {
            console.error("🔥 Connection error:", error);
            ws.close(1011); // Internal Error
        }
    })();
    // console.log(session);

    ws.on("message", async (data) => {
        let msg: MessageType;
        if (!session) {
            console.log("⏳ Message ignored: User not authenticated yet!");
            return;
        }
        console.log('📩 MESSAGE EVENT FIRED for user:', session.email);
        console.log('RAW:', data.toString());
        try {
            msg = JSON.parse(data.toString());
        } catch {
            console.log('Error occurred on message parse!');
            return;
        }

        if (!msg || typeof msg.type !== "string") {
            console.log('No message or wrong type!');
            return;
        }

        // --- Handle join ---
        if (msg.type === "join") {
            if (!session) {
                return ws.close(1008, "❌ Session invalid or expired!");
            }
            const joinMsg = msg as JoinType;
            const meta = getMetaBySocket(ws);
            // console.log(joinMsg);
            // console.log(meta);
            if (meta?.channelId && meta.channelName === joinMsg.channelName) {
                const sysMsg: SystemType = { type: "system", message: "Already in this channel!" };
                ws.send(JSON.stringify(sysMsg));
                return;
            }

            const channel = await getOrCreateChannelByName(joinMsg.channelName);
            if (!channel) {
                ws.send(JSON.stringify({
                    type: "system",
                    message: "Failed to join channel!"
                }));
                return;
            }


            if (meta) {
                switchChannelById(ws, channel.channelId, channel.channelName);
            } else {
                addChannelSocket(ws, { userId: session.userId, email: session.email, channelId: channel.channelId, channelName: channel.channelName });
            }
            const history = await getChatHistoryByChannel(channel.channelId) ?? [];
            sendChatHistoryToClient(ws, history);
            emitPresenceJoin({ userId: session.userId, channelId: channel.channelId });
            console.log("✅ User joined channel:", channel.channelName);
        }

        // --- Handle chat ---
        if (msg.type === "chat") {
            const meta = getMetaBySocket(ws);
            console.log(meta);
            if (!meta) {
                ws.send(JSON.stringify({ type: "system", message: "Join a channel first!" }));
                return;
            }

            const { userId, channelId, email } = meta;
            const chatMsg = msg as ChatType;
            const { message } = chatMsg;
            const { content } = message;

            // Save to DB
            const savedMsg = await insertMessage({ userId, channelId, content });
            if (!savedMsg) {
                console.log('Insert message Failed!');
                return;
            }

            // Broadcast to all clients in the channel
            sendMessageByChannel(channelId, { type: "chat", message: { ...savedMsg, email } });
        }
    });

    ws.on("close", () => {
        if (!session) {
            return ws.close(1008, "❌ Session invalid or expired!");
        }
        const meta = removeChannelSocket(ws);
        if (meta) emitPresenceLeave({ userId: session.userId, channelId: meta.channelId });

        const emitOffline = removeUserSocket(session.userId, ws);
        if (emitOffline) emitUserOffline(session.userId);
    });
});

app.use(express.json());
app.get("/health", (_req, res) => res.json({ ok: true, environment: config.env }));

if (config.env === 'development') {
    server.listen(config.port, () => {
        console.log(`HTTP + WS server listening on port ${config.port}`);
    });
}

export {
    app,
    wss
}