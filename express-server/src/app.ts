import http from "node:http";
import express from "express";
import cors from "cors";
import { WebSocket, WebSocketServer } from "ws";

import config from "./config";
import { CustomError } from "./types/customError";
import { errorHandler } from "./utils/errorHandler";

const app = express();
app.use(cors());
const server = http.createServer(app);
// Create WebSocket server
const wss = new WebSocketServer({ server });

const clients = new Set<WebSocket>([]);

wss.on('connection', ws => {
    console.log('Client connected.');
    clients.add(ws);

    ws.on('message', data => {
        const message = String(data);
        // Broadcast to everyone
        clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        console.log('Client disconnected.');
        clients.delete(ws);
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
    app.listen(config.port, () => {
        console.log(`Server is listening on port ${config.port}`);
    });
}

app.use(errorHandler);

export {
    app
}