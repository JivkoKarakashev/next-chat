import { WSServerEvent } from "@/types/ws-server-types.ts";
import { HandlerContext } from "../socket.dispatcher.ts";

function activeChannelSnapshotHandler(msg: WSServerEvent, ctx: HandlerContext) {
  if (msg.type !== 'active_channel_snapshot') {
    return;
  }
  const { setUsersActiveChannel } = ctx;
  const map: Record<string, string | null> = {};

  msg.data.forEach(({ userId, channelId }) => {
    map[userId] = channelId;
  });

  setUsersActiveChannel(map);
}

export {
  activeChannelSnapshotHandler
}