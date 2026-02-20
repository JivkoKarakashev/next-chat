import { WSServerEvent } from "@/types/ws-server-types.ts";
import { HandlerContext } from "../socket.dispatcher.ts";

function authHandler(msg: WSServerEvent, ctx: HandlerContext): void {
  if (msg.type !== 'auth') {
    return;
  }
  const { setIsReady } = ctx;

  if (msg.content === 'success') {
    setIsReady(true);
  }
}

export {
  authHandler
}