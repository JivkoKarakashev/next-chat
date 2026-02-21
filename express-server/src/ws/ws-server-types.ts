import type WebSocket from "ws";

import { Channel } from "../api/chat";
import { ActiveChannelsSnapshot } from "./connectionStore";

// ============================
//    SERVER → CLIENT
// ============================

type WS = WebSocket;
type EventType = | 'join' | 'leave' | 'online' | 'offline';

//START OF DB ROW TYPES (Not WebSocket Types)
interface DBChannelRow {
  channelId: string,
  channelName: string
}

interface DBMessageRow {
  internalId: number,
  publicId: string,
  userId: string,
  username: string,
  channelId: string,
  type: string,
  content: string,
  createdAt: Date,
  updatedAt: Date | null,
  deletedAt: Date | null
}
//END OF DB ROW TYPES (Not WebSocket Types)

interface DBUserRow {
  id: string,
  username: string
}

interface WSAuthEvent {
  type: 'auth',
  content: 'success' | 'failure'
}

interface WSSystemEvent {
  type: 'system',
  content: string,
  channelId?: string
}

interface WSChatEvent {
  type: 'chat',
  id: string, // public_id
  userId: string,
  username: string,
  channelId: string,
  channelName: string,
  content: string,
  createdAt: Date,
  updatedAt?: Date | null,
  deletedAt?: Date | null,
  receipts: WSReceiptSnapshot[]
}

interface WSEditEvent {
  type: 'edit',
  id: string, // public_id
  content: string,
  updatedAt: Date,
}

interface WSHistoryEvent {
  type: 'history',
  channelId: string,
  channelName: string,
  messages: WSChatEvent[]
}

interface WSPresenceEvent {
  type: 'presence',
  event: EventType,
  userId: string,
  username: string,
  channelId: string,
  channelName: string
}

interface WSChannelCreatedEvent {
  type: 'channel_created',
  channel: Channel
}

interface WSChannelsSnapshotEvent {
  type: 'channels_snapshot',
  channels: Channel[]
}

interface WSSeenUpdateEvent {
  type: 'seen_update',
  messageIds: string[], // public_ids
  userId: string,
  channelId: string,
  seenAt: Date
}

interface WSUnreadSnapshotEvent {
  type: 'unread_snapshot',
  unread: Record<string, number>
}

interface WSUserPresenceEvent {
  type: 'user_presence',
  userId: string,
  online: boolean
}

interface WSOnlineUserSnapshot {
  type: 'online_snapshot',
  users: string[]
}

interface WSActiveChannelsSnapshot {
  type: 'active_channel_snapshot',
  data: ActiveChannelsSnapshot[]
}

interface WSUserActiveChannel {
  type: 'user_active_channel',
  userId: string,
  channelId: string | null
}

type WSUserCreatedEvent = {
  type: 'user_created',
  user: DBUserRow
}

type WSServerEvent =
  | WSAuthEvent
  | WSSystemEvent
  | WSChatEvent
  | WSEditEvent
  | WSHistoryEvent
  | WSPresenceEvent
  | WSChannelCreatedEvent
  | WSChannelsSnapshotEvent
  | WSSeenUpdateEvent
  | WSUnreadSnapshotEvent
  | WSUserPresenceEvent
  | WSOnlineUserSnapshot
  | WSActiveChannelsSnapshot
  | WSUserActiveChannel
  | WSUserCreatedEvent;

interface WSReceiptSnapshot {
  userId: string,
  deliveredAt: Date | null,
  seenAt: Date | null
}

type DBMessageWithReceipts = {
  internalId: number,
  publicId: string,
  channelId: string,
  userId: string,
  username: string,
  content: string,
  createdAt: Date,
  updatedAt: Date,
  receipts: WSReceiptSnapshot[]
}

export {
  type WS,
  type EventType,
  type DBChannelRow,
  type DBMessageRow,
  type DBUserRow,
  type WSAuthEvent,
  type WSSystemEvent,
  type WSChatEvent,
  type WSEditEvent,
  type WSHistoryEvent,
  type WSPresenceEvent,
  type WSChannelCreatedEvent,
  type WSChannelsSnapshotEvent,
  type WSSeenUpdateEvent,
  type WSUnreadSnapshotEvent,
  type WSUserPresenceEvent,
  type WSOnlineUserSnapshot,
  type WSActiveChannelsSnapshot,
  type WSUserActiveChannel,
  type WSUserCreatedEvent,
  type WSServerEvent,
  type WSReceiptSnapshot,
  type DBMessageWithReceipts
}