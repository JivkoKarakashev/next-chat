import { WebSocket as WSRuntime } from 'ws';

import { WSPresenceEvent, WS } from '../ws/ws-server-types.js';
import { getSocketsByChannel } from "../ws/connectionStore.js";

// Emit a presence event to all clients in a channel
const emitPresence = (msg: WSPresenceEvent): void => {
    const clients = getSocketsByChannel(msg.channelId);
    clients.forEach((ws: WS) => {
        if (ws.readyState === WSRuntime.OPEN) {
            ws.send(JSON.stringify(msg));
        }
    });
};

export {
    emitPresence
}