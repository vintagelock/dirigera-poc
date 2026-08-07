import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const TOKEN_FILE = path.join(DATA_DIR, 'token.json');

export interface StoredCredentials {
  accessToken: string;
  gatewayIP?: string;
}

export function readCredentials(): StoredCredentials | undefined {
  if (!existsSync(TOKEN_FILE)) return undefined;
  try {
    const raw = JSON.parse(readFileSync(TOKEN_FILE, 'utf-8')) as { accessToken?: unknown; gatewayIP?: unknown };
    if (typeof raw.accessToken !== 'string') return undefined;
    return {
      accessToken: raw.accessToken,
      gatewayIP: typeof raw.gatewayIP === 'string' ? raw.gatewayIP : undefined,
    };
  } catch {
    return undefined;
  }
}

export function writeCredentials(credentials: StoredCredentials): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(TOKEN_FILE, JSON.stringify(credentials, null, 2), 'utf-8');
}
