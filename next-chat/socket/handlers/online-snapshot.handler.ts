import { WSServerEvent } from "@/types/ws-server-types.ts";
import { HandlerContext } from "../socket.dispatcher.ts";

function onlineSnapshotHandler(msg: WSServerEvent, ctx: HandlerContext) {
  if (msg.type !== "online_snapshot") {
    return;
  }

  ctx.setOnlineUsers(msg.users); // replace completely
}

export {
  onlineSnapshotHandler
}