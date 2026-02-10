import { WS, MessageType, SystemType } from './ws/types';
import { Session } from './utils/validateSession';

import { joinHandler } from './handlers/join.handler';
import { chatHandler } from './handlers/chat.handler';

async function messageRouter(ws: WS, msg: MessageType, session: Session) {
  switch (msg.type) {
    // --- Handle join ---
    case 'join': {
      return joinHandler(ws, msg, session);
    }
    // --- Handle chat ---
    case 'chat': {
      return chatHandler(ws, msg);
    }
    default: {
      const sysMsg: SystemType = {
        type: 'system',
        userId: 'system',
        content: `Unknown message type: ${msg.type}`,
        event: null,
        channelName: null
      };
      ws.send(JSON.stringify(sysMsg));
    }
  }
}

export {
  messageRouter
}
