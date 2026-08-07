import { Router } from 'express';
import { isPaired, pair } from '../dirigeraClient.js';
import { asyncHandler } from '../asyncHandler.js';

export const authRouter = Router();

authRouter.get('/status', (_req, res) => {
  res.json({ paired: isPaired() });
});

authRouter.post(
  '/pair',
  asyncHandler(async (_req, res) => {
    try {
      await pair();
      res.json({ paired: true });
    } catch (err) {
      res.status(422).json({
        error: 'pairing_failed',
        message: err instanceof Error ? err.message : 'Pairing failed',
      });
    }
  }),
);
