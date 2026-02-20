import { WSServerEvent } from "@/types/ws-server-types.ts";
import { HandlerContext } from "../socket.dispatcher.ts";

function seenHandler(msg: WSServerEvent, ctx: HandlerContext) {
  if (msg.type !== 'seen_update') {
    return;
  }
  const { setMessagesByChannel } = ctx;

  setMessagesByChannel(prev => {
    const channelMsgs = prev[msg.channelId];
    if (!channelMsgs) {
      return prev;
    }

    return {
      ...prev,
      [msg.channelId]: channelMsgs.map(m => {
        if (m.type !== "chat") {
          return m;
        }

        if (!msg.messageIds.includes(m.id)) {
          return m;
        }

        return {
          ...m,
          receipts: m.receipts.map(r => {
            if (r.userId === msg.userId) {
              return {
                ...r,
                seenAt: msg.seenAt
              }
            }
            return r;
          }
          )
        };
      })
    };
  });
}

export {
  seenHandler
}