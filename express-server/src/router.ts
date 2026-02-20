import { WS, WSSystemEvent, } from './ws/ws-server-types';
import { Session } from './utils/validateSession';

import { WSClientEvent } from './ws/ws-client-types';
import { joinHandler } from './handlers/join.handler';
import { chatHandler } from './handlers/chat.handler';
import { seenHandler } from './handlers/seen.handler';

async function messageRouter(ws: WS, msg: WSClientEvent, session: Session) {
  switch (msg.type) {
    // --- Handle join ---
    case 'join': {
      return joinHandler(ws, msg, session);
    }
    // --- Handle chat ---
    case 'chat': {
      return chatHandler(ws, msg);
    }
    // --- Handle seen ---
    case 'seen': {
      return seenHandler(ws, msg);
    }
    default: {
      console.log('Unknown message type!');
      const sysMsg: WSSystemEvent = {
        type: 'system',
        content: `Unknown message type: ${msg}`
      };
      ws.send(JSON.stringify(sysMsg));
    }
  }
}

export {
  messageRouter
}
