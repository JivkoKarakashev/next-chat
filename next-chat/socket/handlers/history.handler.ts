import { WSServerEvent } from "@/types/ws-server-types.ts";
import { HandlerContext } from "../socket.dispatcher.ts";

function historyHandler(msg: WSServerEvent, ctx: HandlerContext) {
  // console.log('History from SERVER!', msg);
  if (msg.type !== 'history') {
    return;
  }

  ctx.setActiveChannelId(msg.channelId);
  ctx.setMessagesByChannel(prev => ({
    ...prev,
    [msg.channelId]: msg.messages
  }));
}

export {
  historyHandler
}