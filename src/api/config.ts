import { createApiClient, parseApiOrigin } from './client.ts';
export const apiOrigin = parseApiOrigin(import.meta.env.VITE_API_ORIGIN);
export const api = createApiClient({ origin: apiOrigin });
