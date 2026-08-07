import { Router } from 'express';
import { getClient } from '../dirigeraClient.js';
import { requirePaired } from '../middleware/requirePaired.js';
import { asyncHandler } from '../asyncHandler.js';
import { withHubTimeout } from '../withHubTimeout.js';

export const scenesRouter = Router();
scenesRouter.use(requirePaired);

scenesRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    res.json(await withHubTimeout(getClient().scenes.list()));
  }),
);

scenesRouter.post(
  '/:id/trigger',
  asyncHandler(async (req, res) => {
    await withHubTimeout(getClient().scenes.trigger({ id: req.params.id }));
    res.json({ triggered: true });
  }),
);
