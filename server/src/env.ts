import 'dotenv/config';

export const PORT = Number(process.env.PORT) || 4000;
export const DIRIGERA_HUB_IP = process.env.DIRIGERA_HUB_IP || undefined;
