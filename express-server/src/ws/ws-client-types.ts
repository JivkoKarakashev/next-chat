// ============================
//    CLIENT → SERVER
// ============================

import { WSReceiptSnapshot } from "./ws-server-types";

interface WSJoinRequest {
  type: 'join',
  channelName: string
}

interface WSChatRequest {
  type: 'chat',
  channelId: string,
  content: string
}

interface WSSeenRequest {
  type: 'seen',
  channelId: string,
  lastMessageId: string; // public_id
}

interface ChatMessage {
  id: string,
  userId: string,
  username: string,
  content: string,
  createdAt: Date,
  updatedAt?: Date | null,
  deletedAt?: Date | null,
  receipts: WSReceiptSnapshot[]
}


type WSClientEvent = | WSJoinRequest | WSChatRequest | WSSeenRequest;

export {
  type WSJoinRequest,
  type WSChatRequest,
  type WSSeenRequest,
  type WSClientEvent,
  type ChatMessage
}