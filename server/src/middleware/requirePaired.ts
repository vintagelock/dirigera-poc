import type { NextFunction, Request, Response } from 'express';
import { isPaired } from '../dirigeraClient.js';

export function requirePaired(_req: Request, res: Response, next: NextFunction): void {
  if (!isPaired()) {
    res.status(409).json({ error: 'unpaired' });
    return;
  }
  next();
}
