import { Request, Response } from 'express';

import { getAllChannels } from './chat.js';

const channelsHandler = async (_: Request, res: Response) => {
    const allChannels = await getAllChannels();
    // console.log(allChannels);
    return res.status(200).json(allChannels);
};

export {
  channelsHandler
}