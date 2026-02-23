import { Request, Response, NextFunction } from "express";

import { env } from "../env";

const requireXInternalSecret = (req: Request, res: Response, next: NextFunction) => {
  const headerValue = req.get('x-internal-secret');

  if (headerValue === env.X_INTERNAL_SECRET) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized!' });
  }
};

export {
  requireXInternalSecret
}