import { WS } from '../ws/ws-server-types.js';

interface ClientMeta {
  userId: string,
  username: string,
  channelId: string,
  channelName: string,
}

// Store sockets by user
const userSockets = new Map<string, Set<WS>>();

// Store sockets by channel
const channelSockets = new Map<string, Set<WS>>();

// Store metadata for each WebSocket
const socketMeta = new Map<WS, ClientMeta>();

// Store active channel by user
const userActiveChannel = new Map<string, string | null>();

// --- User socket management ---
const addUserSocket = (userId: string, ws: WS): boolean => {
  if (!userSockets.has(userId)) {
    userSockets.set(userId, new Set());
  }
  const sockets = userSockets.get(userId)!;
  sockets.add(ws);
  // Return true if first socket for this user (user came online)
  return sockets.size === 1;
};

const removeUserSocket = (userId: string, ws: WS): boolean => {
  const sockets = userSockets.get(userId);
  if (!sockets) {
    return false;
  }

  sockets.delete(ws);
  if (sockets.size === 0) {
    userSockets.delete(userId);
    userActiveChannel.set(userId, null);
    return true; // user went offline
  }
  return false;
};

// --- Channel socket management ---
const addChannelSocket = (ws: WS, meta: ClientMeta): void => {
  const { channelId } = meta;
  socketMeta.set(ws, meta);

  if (!channelSockets.has(channelId)) {
    channelSockets.set(channelId, new Set());
  }
  channelSockets.get(channelId)?.add(ws);
};

const removeChannelSocket = (ws: WS): ClientMeta | undefined => {
  const meta = socketMeta.get(ws);
  if (!meta) {
    console.log('Missing meta!');
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

const switchChannelById = (ws: WS, newChannelId: string, newChannelName: string): void => {
  const meta = socketMeta.get(ws);
  if (!meta) {
    console.log('Missing meta!');
    return;
  }

  removeChannelSocket(ws);
  addChannelSocket(ws, { ...meta, channelId: newChannelId, channelName: newChannelName });
};

const getSocketsByChannel = (channelId: string): ReadonlySet<WS> => {
  return channelSockets.get(channelId) ?? new Set();
};

const getMetaBySocket = (ws: WS): ClientMeta | undefined => {
  return socketMeta.get(ws);
};

const getSocketsByUserId = (userId: string): ReadonlySet<WS> | undefined => {
  return userSockets.get(userId);
};

const getOnlineUserIds = (): string[] => {
  return [...userSockets.keys()];
};

const setUserActiveChannel = (userId: string, channelId: string | null): void => {
  userActiveChannel.set(userId, channelId);
};

const getUserActiveChannel = (userId: string): string | null => {
  return userActiveChannel.get(userId) ?? null;
};

interface ActiveChannelsSnapshot {
  userId: string,
  channelId: string | null
}

const getActiveChannelsSnapshot = (): ActiveChannelsSnapshot[] => {
  const entries = Array.from(userActiveChannel.entries());
  return entries.map(([userId, channelId]) => ({ userId, channelId }));
};

export {
  type ClientMeta,
  addUserSocket,
  removeUserSocket,
  addChannelSocket,
  removeChannelSocket,
  switchChannelById,
  getSocketsByChannel,
  getMetaBySocket,
  getSocketsByUserId,
  getOnlineUserIds,
  setUserActiveChannel,
  getUserActiveChannel,
  type ActiveChannelsSnapshot,
  getActiveChannelsSnapshot
}