import { WSServerEvent } from "@/types/ws-server-types.ts";
import { HandlerContext } from "../socket.dispatcher.ts";

function systemHandler(msg: WSServerEvent, ctx: HandlerContext) {
  // System messages might not belong to channel
  // If they do, ensure they contain channelId
  if (msg.type !== 'system') {
    return;
  }

  const channelId = msg.channelId;
  if (!channelId) {
    return;
  }

  ctx.setMessagesByChannel(prev => ({
    ...prev,
    [channelId]: [
      ...(prev[channelId] ?? []),
      msg
    ]
  }));
}

export {
  systemHandler
}