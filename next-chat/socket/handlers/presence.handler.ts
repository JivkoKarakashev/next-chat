import { WSServerEvent } from "@/types/ws-server-types.ts";
import { HandlerContext } from "../socket.dispatcher.ts";

function presenceHandler(msg: WSServerEvent, ctx: HandlerContext) {
    if (msg.type !== 'presence') {
        return;
    }
    ctx.setMessagesByChannel(prev => ({
        ...prev,
        [msg.channelId]: [
            ...(prev[msg.channelId] ?? []),
            msg
        ]
    }));
}

export {
    presenceHandler
}