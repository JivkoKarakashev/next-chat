import { Request, Response } from 'express';

import { broadcastAll } from '../utils/broadcast.js';
import { WSUserCreatedEvent } from '../ws/ws-server-types.js';

const userCreatedHandler = (req: Request, res: Response) => {
  const { id, username } = req.body;

  if (!id || !username) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const event: WSUserCreatedEvent = {
    type: 'user_created',
    user: {
      id,
      username
    }
  };

  broadcastAll(event);

  return res.sendStatus(204);
};

export {
  userCreatedHandler
}