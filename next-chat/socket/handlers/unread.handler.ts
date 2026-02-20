import { WSServerEvent } from "@/types/ws-server-types.ts";
import { HandlerContext } from "../socket.dispatcher.ts";

function unreadHandler(msg: WSServerEvent, ctx: HandlerContext) {
  if (msg.type !== 'unread_snapshot') {
    return;
  }
  ctx.setUnreadByChannel(msg.unread);
}

export {
  unreadHandler
}