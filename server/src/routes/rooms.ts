import { Router } from 'express';
import { getClient } from '../dirigeraClient.js';
import { requirePaired } from '../middleware/requirePaired.js';
import { asyncHandler } from '../asyncHandler.js';
import { withHubTimeout } from '../withHubTimeout.js';

export const roomsRouter = Router();
roomsRouter.use(requirePaired);

roomsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const client = getClient();
    const [rooms, devices] = await withHubTimeout(Promise.all([client.rooms.list(), client.devices.list()]));
    const roomsWithDevices = rooms.map((room) => ({
      ...room,
      devices: devices.filter((device) => device.room?.id === room.id),
    }));
    res.json(roomsWithDevices);
  }),
);
