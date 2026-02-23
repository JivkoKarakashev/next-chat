import { WS, WSSystemEvent, } from './ws/ws-server-types.js';
import { WSClientEvent } from './ws/ws-client-types.js';
import { Session } from './utils/validateSession.js';

import { joinHandler } from './handlers/join.handler.js';
import { chatHandler } from './handlers/chat.handler.js';
import { seenHandler } from './handlers/seen.handler.js';

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
