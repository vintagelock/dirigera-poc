import { createDirigeraClient, type DirigeraClient } from 'dirigera';
import { DIRIGERA_HUB_IP } from './env.js';
import { readCredentials, writeCredentials } from './tokenStore.js';
import { discoverGatewayIP } from './discoverGatewayIP.js';
import { startBroadcasting } from './services/eventBroadcaster.js';

export class UnpairedError extends Error {
  constructor() {
    super('Not paired with a Dirigera hub yet');
    this.name = 'UnpairedError';
  }
}

let client: DirigeraClient | undefined;

// mDNS discovery is non-deterministic (it resolves on whichever network
// answer arrives first, see discoverGatewayIP.ts) and slow, so it should
// only ever run once per pairing. The resolved IP is cached alongside the
// token and reused on every restart instead of re-discovering every time.
export async function initClientFromStoredToken(): Promise<void> {
  const credentials = readCredentials();
  if (!credentials) {
    console.info('No stored credentials, waiting to be paired');
    return;
  }
  try {
    let gatewayIP = DIRIGERA_HUB_IP ?? credentials.gatewayIP;
    if (!gatewayIP) {
      console.info('No cached gateway IP, discovering...');
      gatewayIP = await discoverGatewayIP();
    }
    console.info(`Connecting to hub at ${gatewayIP} with stored token`);
    client = await createDirigeraClient({ gatewayIP, accessToken: credentials.accessToken });
    if (credentials.gatewayIP !== gatewayIP) {
      writeCredentials({ accessToken: credentials.accessToken, gatewayIP });
    }
    startBroadcasting(client);
    console.info('Connected to hub');
  } catch (err) {
    console.error('Failed to connect to the Dirigera hub with the stored token:', err);
  }
}

export function getClient(): DirigeraClient {
  if (!client) throw new UnpairedError();
  return client;
}

export function isPaired(): boolean {
  return client !== undefined;
}

export async function pair(): Promise<void> {
  console.info('Starting pairing...');
  const gatewayIP = DIRIGERA_HUB_IP ?? (await discoverGatewayIP());
  const pairingClient = await createDirigeraClient({ gatewayIP });
  console.info('Waiting for the hub action button to be pressed...');
  const accessToken = await pairingClient.authenticate();
  console.info('Pairing succeeded, saving credentials');
  writeCredentials({ accessToken, gatewayIP });
  client = await createDirigeraClient({ gatewayIP, accessToken });
  startBroadcasting(client);
  console.info('Connected to hub');
}
