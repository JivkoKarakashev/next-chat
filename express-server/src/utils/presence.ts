import { WebSocket as WSRuntime } from 'ws';

import { WS } from '../ws/types';
import { getSocketsByChannel } from "../ws/connectionStore";

type EventType = 'join' | 'leave' | 'online' | 'offline';

interface PresenceEvent {
    type: 'presence',
    event: EventType,
    userId: string,
    channelId?: string
}

// Emit a presence event to all clients in a channel
const emitPresenceJoin = ({ userId, channelId }: { userId: string; channelId: string }): void => {
    const clients = getSocketsByChannel(channelId);
    const event: PresenceEvent = { type: 'presence', event: 'join', userId, channelId };
    clients.forEach((ws: WS) => {
        if (ws.readyState === WSRuntime.OPEN) {
            ws.send(JSON.stringify(event));
        }
    });
};

const emitPresenceLeave = ({ userId, channelId }: { userId: string; channelId: string }): void => {
    const clients = getSocketsByChannel(channelId);
    const event: PresenceEvent = { type: 'presence', event: 'leave', userId, channelId };
    clients.forEach((ws: WS) => {
        if (ws.readyState === WSRuntime.OPEN) {
            ws.send(JSON.stringify(event));
        }
    });
};

// Emit online/offline globally for user
const emitUserOnline = (userId: string, sockets: WS[] = []): void => {
    const event: PresenceEvent = { type: 'presence', event: 'online', userId };
    sockets.forEach((ws: WS) => {
        if (ws.readyState === WSRuntime.OPEN) {
            ws.send(JSON.stringify(event));
        }
    });
};

const emitUserOffline = (userId: string, sockets: WS[] = []): void => {
    const event: PresenceEvent = { type: 'presence', event: 'offline', userId };
    sockets.forEach((ws: WS) => {
        if (ws.readyState === WSRuntime.OPEN) {
            ws.send(JSON.stringify(event));
        }
    });
};

export {
    emitPresenceJoin,
    emitPresenceLeave,
    emitUserOnline,
    emitUserOffline
}