import { WSServerEvent } from "@/types/ws-server-types.ts";
import { HandlerContext } from "../socket.dispatcher.ts";


function channelCreatedHandler(msg: WSServerEvent, ctx: HandlerContext) {
  if (msg.type !== 'channel_created') {
    return;
  }

  ctx.setChannels(prev => {
    if (prev.some(c => c.channelId === msg.channel.channelId)) {
      return prev;
    }
    return [...prev, msg.channel];
  });
}

export {
  channelCreatedHandler
}