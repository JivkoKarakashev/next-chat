import { WSServerEvent } from "@/types/ws-server-types.ts";
import { HandlerContext } from "../socket.dispatcher.ts";

function userPresenceHandler(msg: WSServerEvent, ctx: HandlerContext) {
  if (msg.type !== 'user_presence') {
    return;
  }

  ctx.setOnlineUsers(prev => {
    if (msg.online) {
      if (prev.includes(msg.userId)) {
        return prev;
      }
      return [...prev, msg.userId];
    } else {
      return prev.filter(id => id !== msg.userId);
    }
  });
}

export {
  userPresenceHandler
}