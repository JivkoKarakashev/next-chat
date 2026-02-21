import { WSServerEvent } from "@/types/ws-server-types.ts";
import { HandlerContext } from "../socket.dispatcher.ts";

function userCreatedHandler(msg: WSServerEvent, ctx: HandlerContext): void {
  if (msg.type !== 'user_created') {
    return;
  }
  const { setAllUsers } = ctx;
  setAllUsers(prev => {
    if (prev.some(u => u.id === msg.user.id)) {
      return prev;
    }
    return [...prev, msg.user].sort((a, b) => a.username.localeCompare(b.username));
  });

}

export {
  userCreatedHandler
}