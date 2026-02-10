import { WebSocket as WSRuntime } from 'ws';

import { PresenceType, WS } from '../ws/types';
import { getSocketsByChannel } from "../ws/connectionStore";
import { generateSecureRandomId as generateId } from './secure-random-string';

type EventType = 'join' | 'leave' | 'online' | 'offline';

interface PresenceEvent {
    type: 'presence',
    event: EventType,
    userId: string,
    channelId?: string
}

// Emit a presence event to all clients in a channel
const emitPresence = ({ event, userId, username, channelName, channelId }: { event: EventType, userId: string, username: string, channelId: string, channelName: string }): void => {
    const clients = getSocketsByChannel(channelId);
    const id = generateId();
    const presMsg: PresenceType = {
        id,
        userId,
        username,
        channelId,
        channelName,
        type: 'presence',
        event
    };
    clients.forEach((ws: WS) => {
        if (ws.readyState === WSRuntime.OPEN) {
            ws.send(JSON.stringify(presMsg));
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
    emitPresence,
    emitUserOnline,
    emitUserOffline
}