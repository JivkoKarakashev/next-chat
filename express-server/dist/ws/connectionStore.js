"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveChannelsSnapshot = exports.getUserActiveChannel = exports.setUserActiveChannel = exports.getOnlineUserIds = exports.getSocketsByUserId = exports.getMetaBySocket = exports.getSocketsByChannel = exports.switchChannelById = exports.removeChannelSocket = exports.addChannelSocket = exports.removeUserSocket = exports.addUserSocket = void 0;
// Store sockets by user
const userSockets = new Map();
// Store sockets by channel
const channelSockets = new Map();
// Store metadata for each WebSocket
const socketMeta = new Map();
// Store active channel by user
const userActiveChannel = new Map();
// --- User socket management ---
const addUserSocket = (userId, ws) => {
    if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
    }
    const sockets = userSockets.get(userId);
    sockets.add(ws);
    // Return true if first socket for this user (user came online)
    return sockets.size === 1;
};
exports.addUserSocket = addUserSocket;
const removeUserSocket = (userId, ws) => {
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
exports.removeUserSocket = removeUserSocket;
// --- Channel socket management ---
const addChannelSocket = (ws, meta) => {
    const { channelId } = meta;
    socketMeta.set(ws, meta);
    if (!channelSockets.has(channelId)) {
        channelSockets.set(channelId, new Set());
    }
    channelSockets.get(channelId)?.add(ws);
};
exports.addChannelSocket = addChannelSocket;
const removeChannelSocket = (ws) => {
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
exports.removeChannelSocket = removeChannelSocket;
const switchChannelById = (ws, newChannelId, newChannelName) => {
    const meta = socketMeta.get(ws);
    if (!meta) {
        console.log('Missing meta!');
        return;
    }
    removeChannelSocket(ws);
    addChannelSocket(ws, { ...meta, channelId: newChannelId, channelName: newChannelName });
};
exports.switchChannelById = switchChannelById;
const getSocketsByChannel = (channelId) => {
    return channelSockets.get(channelId) ?? new Set();
};
exports.getSocketsByChannel = getSocketsByChannel;
const getMetaBySocket = (ws) => {
    return socketMeta.get(ws);
};
exports.getMetaBySocket = getMetaBySocket;
const getSocketsByUserId = (userId) => {
    return userSockets.get(userId);
};
exports.getSocketsByUserId = getSocketsByUserId;
const getOnlineUserIds = () => {
    return [...userSockets.keys()];
};
exports.getOnlineUserIds = getOnlineUserIds;
const setUserActiveChannel = (userId, channelId) => {
    userActiveChannel.set(userId, channelId);
};
exports.setUserActiveChannel = setUserActiveChannel;
const getUserActiveChannel = (userId) => {
    return userActiveChannel.get(userId) ?? null;
};
exports.getUserActiveChannel = getUserActiveChannel;
const getActiveChannelsSnapshot = () => {
    const entries = Array.from(userActiveChannel.entries());
    return entries.map(([userId, channelId]) => ({ userId, channelId }));
};
exports.getActiveChannelsSnapshot = getActiveChannelsSnapshot;
