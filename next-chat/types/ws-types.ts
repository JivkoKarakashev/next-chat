import { Channel } from "./channel.ts";

type MType = | 'join' | 'chat' | 'system' | 'history' | 'edit' | 'presence';

type EventType = | 'join' | 'leave' | 'online' | 'offline';

// Chat message structure stored in DB
interface DBType {
  id: string,
  userId: string,
  channelId: string,
  type: MType,
  content: string,
  event: EventType | null,
  createdAt: Date,
  updatedAt: Date | null
}

interface BaseType extends Omit<DBType, 'id' | 'channelId' | 'content' | 'createdAt' | 'updatedAt'> {
  id?: string,
  userId: string,
  username?: string
  channelId?: string,
  channelName: string | null,
  content?: string,
  createdAt?: Date,
  updatedAt?: Date | null
}

/* ---------- MESSAGE ENVELOPES ---------- */
interface JoinType extends BaseType {
  type: 'join'
}

interface ChatType extends BaseType {
  type: 'chat'
}

interface HistoryType extends Omit<BaseType, 'content'> {
  userId: 'history',
  type: 'history',
  content: ChatType[]
}

interface SystemType extends BaseType {
  userId: 'system',
  type: 'system'
}

interface PresenceType extends BaseType {
  type: 'presence',
  event: EventType,
  channelId: string
}

interface CreatedChannelType {
  userId: 'system',
  type: 'channel_created',
  channel: Channel
}

interface ChannelsSnapshotType {
  userId: 'system',
  type: 'channels_snapshot',
  channels: Channel[]
}

/* ---------- UNION ---------- */
type MessageType = | JoinType | ChatType | HistoryType | SystemType | PresenceType | CreatedChannelType | ChannelsSnapshotType;

export {
  type MType,
  type EventType,
  type DBType,
  type BaseType,
  type JoinType,
  type ChatType,
  type HistoryType,
  type SystemType,
  type PresenceType,
  type CreatedChannelType,
  type ChannelsSnapshotType,
  type MessageType
}
