import { WSServerEvent } from "@/types/ws-server-types.ts";
import { HandlerContext } from "../socket.dispatcher.ts";


function chatHandler(msg: WSServerEvent, ctx: HandlerContext) {
  if (msg.type !== 'chat') {
    return;
  }
  const { setMessagesByChannel } = ctx;

  setMessagesByChannel(prev => ({
    ...prev,
    [msg.channelId]: [
      ...(prev[msg.channelId] ?? []),
      msg
    ]
  }));
}

export {
  chatHandler
}