import http from "node:http";
import express from "express";
import cors from "cors";
import { WebSocket, WebSocketServer } from "ws";

import config from "./config";
import { MessageType, SystemType } from "./types/ws-types";
import { CustomError } from "./types/customError";
import { errorHandler } from "./utils/errorHandler";
import { broadcast } from "./utils/broadcast";

const app = express();
app.use(cors());

// Create WebSocket server
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected.');

    ws.on('error', (err) => {
        console.error("WebSocket error:", err)
    });
    ws.on('message', (data) => {
        console.log('RAW:', data.toString());
        const msg = JSON.parse(data.toString()) as MessageType;
        console.log('PASSED:', msg);

        if (msg.type === 'join') {
            const { username } = msg;
            const newMsg: SystemType = {
                type: 'system',
                message: {
                    id: crypto.randomUUID(),
                    content: `${username} joined `,
                }
            };
            return broadcast(newMsg);
        }
        return broadcast(msg);
    });
    ws.on('close', () => {
        console.log('Client disconnected.');
    });
});

app.use(express.json());
app.get("/sync-error", (_req, _res) => {
    // throw new Error("Synchronous error occurred!");
    throw new CustomError(500, "Synchronous error occurred!");
});
app.get("/async-error", async (_req, _res, next) => {
    try {
        // await Promise.reject(new Error("Async error occurred!"));
        await Promise.reject(new CustomError(500, "Async error occurred!"));
    } catch (err) {
        next(err);
    }
});
app.get('/health', (_req, res) => {
    res.json({ ok: true, environment: config.env });
});

if (config.env === 'development') {
    server.listen(config.port, () => {
        console.log(`HTTP + WS server listening on port ${config.port}`);
    });
}

app.use(errorHandler);

export {
    app,
    wss
}