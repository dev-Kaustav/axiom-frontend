import { ApiError } from './errors.ts';
import type { HealthOut } from './types.ts';

export type ApiOrigin = { readonly configured: true; readonly base: string } | { readonly configured: false; readonly raw: string | null };
export function parseApiOrigin(raw: unknown): ApiOrigin {
  const value = typeof raw === 'string' ? raw.trim() : '';
  const invalid: ApiOrigin = { configured: false, raw: typeof raw === 'string' ? raw : null };
  if (!value || /[\\\s?#]/.test(value)) return invalid;
  if (value.startsWith('/') && !value.startsWith('//')) return { configured: true, base: value.replace(/\/+$/, '') };
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) return invalid;
    return { configured: true, base: value.replace(/\/+$/, '') };
  } catch { return invalid; }
}

export function parseJsonLossless(text: string): unknown {
  try {
    return JSON.parse(text, (_key, value) => {
      if (typeof value === 'number' && !Number.isSafeInteger(value)) throw new Error('Unsafe JSON number');
      return value;
    });
  } catch { throw new ApiError({ kind: 'unexpected_response' }); }
}
export interface RequestOptions { signal?: AbortSignal; pinSnapshotId?: string | null }
export interface ApiClient {
  readonly origin: ApiOrigin;
  request<T>(method: 'GET' | 'POST', path: string, init?: RequestOptions & { query?: Record<string, string>; body?: unknown }): Promise<T>;
  getHealth(opts?: RequestOptions): Promise<HealthOut>;
}
export function createApiClient(init: { origin: ApiOrigin; fetch?: typeof fetch; now?: () => number }): ApiClient {
  const fetcher = init.fetch ?? globalThis.fetch;
  const request: ApiClient['request'] = async (method, path, options = {}) => {
    options.signal?.throwIfAborted();
    if (!init.origin.configured) throw new ApiError({ kind: 'not_configured' });
    let response: Response;
    try {
      response = await fetcher(init.origin.base + path, { method, headers: { Accept: 'application/json' }, signal: options.signal });
    } catch (error) {
      options.signal?.throwIfAborted();
      if (error instanceof Error && error.name === 'AbortError') throw error;
      throw new ApiError({ kind: 'network' });
    }
    const requestId = response.headers.get('x-request-id');
    if (!response.ok) throw new ApiError({ kind: [502, 503, 504].includes(response.status) ? 'server_unavailable' : 'unexpected_response', status: response.status, requestId });
    const text = await response.text();
    options.signal?.throwIfAborted();
    try { return parseJsonLossless(text) as never; }
    catch { throw new ApiError({ kind: 'unexpected_response', status: response.status, requestId }); }
  };
  return { origin: init.origin, request, getHealth: opts => request('GET', '/health', opts) };
}
