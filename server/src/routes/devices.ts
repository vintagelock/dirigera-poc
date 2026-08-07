import { Router } from 'express';
import type { Device } from 'dirigera';
import { getClient } from '../dirigeraClient.js';
import { requirePaired } from '../middleware/requirePaired.js';
import { asyncHandler } from '../asyncHandler.js';
import { withHubTimeout } from '../withHubTimeout.js';

export const devicesRouter = Router();
devicesRouter.use(requirePaired);

const PATCHABLE_ATTRIBUTES: Record<string, readonly string[]> = {
  light: ['isOn', 'lightLevel', 'colorTemperature', 'colorHue', 'colorSaturation'],
  outlet: ['isOn', 'childLock', 'statusLight'],
};

devicesRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    res.json(await withHubTimeout(getClient().devices.list()));
  }),
);

devicesRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json(await withHubTimeout(getClient().devices.get({ id: req.params.id })));
  }),
);

devicesRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const client = getClient();
    const device: Device = await withHubTimeout(client.devices.get({ id: req.params.id }));
    const allowedKeys = PATCHABLE_ATTRIBUTES[device.type];

    if (!allowedKeys) {
      res
        .status(400)
        .json({ error: 'unsupported_device_type', message: `Cannot control devices of type "${device.type}"` });
      return;
    }

    const body = (req.body ?? {}) as Record<string, unknown>;
    const { transitionTime, ...rest } = body;
    const attributes: Record<string, unknown> = {};
    for (const key of Object.keys(rest)) {
      if (allowedKeys.includes(key)) attributes[key] = rest[key];
    }

    if (Object.keys(attributes).length === 0) {
      res.status(400).json({ error: 'no_valid_attributes', allowedKeys });
      return;
    }

    await withHubTimeout(
      client.devices.setAttributes({
        id: req.params.id,
        attributes,
        transitionTime: typeof transitionTime === 'number' ? transitionTime : undefined,
      }),
    );

    res.json(await withHubTimeout(client.devices.get({ id: req.params.id })));
  }),
);
