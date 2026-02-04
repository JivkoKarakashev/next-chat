type MType = | 'join' | 'chat' | 'system' | 'history' | 'edit' | 'presence';

type EventType = | 'join' | 'leave' | 'online' | 'offline';

interface BaseType {
  type: MType
}

interface ChatMessage {
  id?: string,
  userId?: string,
  channelId?: string,
  channelName?: string,
  email?: string,
  content: string,
  createdAt?: Date,
  updatedAt?: Date | null
}

/* ---------- MESSAGE ENVELOPES ---------- */
interface JoinType extends BaseType {
  type: 'join',
  channelName: string
}

interface ChatType extends BaseType {
  type: 'chat',
  message: ChatMessage
}

interface HistoryType extends BaseType {
  type: 'history',
  messages: ChatMessage[]
}

interface SystemType extends BaseType {
  type: 'system',
  message: string
}

interface PresenceType extends BaseType {
  type: 'presence',
  event: EventType,
  userId: string,
  channelId?: string
}

/* ---------- UNION ---------- */
type MessageType = | JoinType | ChatType | HistoryType | SystemType | PresenceType;

export {
  type MType,
  type BaseType,
  type ChatMessage,
  type JoinType,
  type ChatType,
  type SystemType,
  type MessageType
}
