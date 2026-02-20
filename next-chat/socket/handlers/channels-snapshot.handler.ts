import { WSServerEvent } from "@/types/ws-server-types.ts";
import { HandlerContext } from "../socket.dispatcher.ts";

function channelsSnapshotHandler(msg: WSServerEvent, ctx: HandlerContext) {
  // console.log(msg);
  if (msg.type !== 'channels_snapshot') {
    return;
  }

  const { setChannels } = ctx;
  setChannels(msg.channels);
}

export {
  channelsSnapshotHandler
}