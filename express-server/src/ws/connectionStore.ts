import { WS } from '../ws/types';

export interface ClientMeta {
    userId: string,
    username: string,
    channelId: string,
    channelName: string,
};

// Store sockets by user
const userSockets = new Map<string, Set<WS>>();

// Store sockets by channel
const channelSockets = new Map<string, Set<WS>>();

// Store metadata for each WebSocket
const socketMeta = new Map<WS, ClientMeta>();

// --- User socket management ---
export const addUserSocket = (userId: string, ws: WS): boolean => {
    if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
    }
    const set = userSockets.get(userId)!;
    set.add(ws);
    // Return true if first socket for this user (user came online)
    return set.size === 1;
};

export const removeUserSocket = (userId: string, ws: WS): boolean => {
    const set = userSockets.get(userId);
    if (!set) {
        return false;
    }

    set.delete(ws);
    if (set.size === 0) {
        userSockets.delete(userId);
        return true; // user went offline
    }
    return false;
};

// --- Channel socket management ---
export const addChannelSocket = (ws: WS, meta: ClientMeta): void => {
    const { channelId } = meta;
    socketMeta.set(ws, meta);

    if (!channelSockets.has(channelId)) {
        channelSockets.set(channelId, new Set());
    }
    channelSockets.get(channelId)?.add(ws);
};

export const removeChannelSocket = (ws: WS): ClientMeta | undefined => {
    const meta = socketMeta.get(ws);
    if (!meta) {
        return;
    }

    const { channelId } = meta;
    channelSockets.get(channelId)?.delete(ws);
    if (channelSockets.get(channelId)?.size === 0) {
        channelSockets.delete(channelId);
    }

    socketMeta.delete(ws);
    return meta;
};

export const switchChannelById = (ws: WS, newChannelId: string, newChannelName: string): void => {
    const meta = socketMeta.get(ws);
    if (!meta) {
        return;
    }

    removeChannelSocket(ws);
    addChannelSocket(ws, { ...meta, channelId: newChannelId, channelName: newChannelName });
};

export const getSocketsByChannel = (channelId: string): ReadonlySet<WS> => {
    return channelSockets.get(channelId) ?? new Set();
};

export const getMetaBySocket = (ws: WS): ClientMeta | undefined => {
    return socketMeta.get(ws);
};
