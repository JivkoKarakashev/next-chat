import { WSServerEvent } from "@/types/ws-server-types.ts";
import { HandlerContext } from "../socket.dispatcher.ts";

function usersActiveChannelHandler(msg: WSServerEvent, ctx: HandlerContext) {
  if (msg.type !== 'user_active_channel') {
    return;
  }
  const { setUsersActiveChannel } = ctx;

  setUsersActiveChannel(prev => ({
    ...prev,
    [msg.userId]: msg.channelId
  }));
}

export {
  usersActiveChannelHandler
}