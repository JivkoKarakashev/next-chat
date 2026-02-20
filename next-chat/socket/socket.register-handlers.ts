import { registerHandler } from "./socket.dispatcher.ts";

import { authHandler } from "./handlers/auth.handler.ts";
import { unreadHandler } from "./handlers/unread.handler.ts";
import { chatHandler } from "./handlers/chat.handler.ts";
import { seenHandler } from "./handlers/seen.handler.ts";
import { presenceHandler } from "./handlers/presence.handler.ts";
import { systemHandler } from "./handlers/system.handler.ts";
import { historyHandler } from "./handlers/history.handler.ts";
import { channelCreatedHandler } from "./handlers/channel-created.handler.ts";
import { channelsSnapshotHandler } from "./handlers/channels-snapshot.handler.ts";
import { userPresenceHandler } from "./handlers/user-presence.handler.ts";
import { onlineSnapshotHandler } from "./handlers/online-snapshot.handler.ts";
import { activeChannelSnapshotHandler } from "./handlers/active-channel-snapshot.handler.ts";
import { usersActiveChannelHandler } from "./handlers/users-active-channel.handler.ts";

function registerAllHandlers() {
  registerHandler('auth', authHandler);
  registerHandler('online_snapshot', onlineSnapshotHandler);
  registerHandler('user_presence', userPresenceHandler);
  registerHandler('unread_snapshot', unreadHandler);
  registerHandler('chat', chatHandler);
  registerHandler('seen_update', seenHandler);
  registerHandler('presence', presenceHandler);
  registerHandler('system', systemHandler);
  registerHandler('history', historyHandler);
  registerHandler('channel_created', channelCreatedHandler);
  registerHandler('channels_snapshot', channelsSnapshotHandler);
  registerHandler('active_channel_snapshot', activeChannelSnapshotHandler);
  registerHandler('user_active_channel', usersActiveChannelHandler);
}

export {
  registerAllHandlers
}