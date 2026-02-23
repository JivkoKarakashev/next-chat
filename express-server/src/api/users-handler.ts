import { Request, Response } from 'express';

import { getAllUsers } from '../api/users.js';

const usersHandler = async (_: Request, res: Response) => {
  const users = await getAllUsers();
  // console.log(users);
  return res.status(200).json(users);
};

export {
  usersHandler
}