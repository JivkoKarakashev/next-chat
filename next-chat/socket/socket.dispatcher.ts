import { Dispatch, SetStateAction } from "react";

import { UIMessage, WSServerEvent, WSServerEventType } from "@/types/ws-server-types.ts";
import { Channel } from "@/types/channel.ts";


interface HandlerContext {
  // setConnected: Dispatch<SetStateAction<boolean>>,
  setIsReady: Dispatch<SetStateAction<boolean>>,
  setChannels: Dispatch<SetStateAction<Channel[]>>,
  setActiveChannelId: Dispatch<SetStateAction<string | null>>,
  setMessagesByChannel: Dispatch<SetStateAction<Record<string, UIMessage[]>>>,
  setUnreadByChannel: Dispatch<SetStateAction<Record<string, number>>>,
  setOnlineUsers: Dispatch<SetStateAction<string[]>>,
  setUsersActiveChannel: Dispatch<SetStateAction<Record<string, string | null>>>
}

type Handler = (msg: WSServerEvent, ctx: HandlerContext) => void;

const handlers = new Map<string, Handler>();

function registerHandler(type: WSServerEventType, handler: Handler): void {
  if (!handlers.has(type)) {
    handlers.set(type, handler);
  }
}

function dispatchMessage(msg: WSServerEvent, ctx: HandlerContext) {
  const handler = handlers.get(msg.type);
  if (handler) {
    handler(msg, ctx);
  }
}

export {
  type HandlerContext,
  registerHandler,
  dispatchMessage
}