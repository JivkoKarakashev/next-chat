import type WebSocket from "ws";

export type WS = WebSocket;

type MType = 'join' | 'chat' | 'system' | 'history';

interface BaseType {
    type: MType;
}

// Chat message structure stored in DB
export interface ChatMessage {
    id: string,
    userId?: string,
    channelId: string, // Make required if every message must belong to a channel
    channelName?: string, // Optional if you want to broadcast the channel name
    email?: string,
    content: string,
    createdAt?: Date,
    updatedAt?: Date | null
}

// Join message (from client)
export interface JoinType extends BaseType {
    type: 'join',
    channelName: string
}

// Chat message from client
export interface ChatType extends BaseType {
    type: 'chat',
    message: ChatMessage
}

// History sent from server
export interface HistoryType extends BaseType {
    type: 'history',
    messages: ChatMessage[]
}

// System message
export interface SystemType extends BaseType {
    type: 'system',
    message: string
}

export type MessageType = JoinType | ChatType | HistoryType | SystemType;