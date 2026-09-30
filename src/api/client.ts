import { ApiError, mapHttpError } from './errors.ts';
import { isDecimalString } from './types.ts';
import type { HealthOut, OpaqueId, ResolveOut, InstrumentOut, BasisOut, ExposureRequest, ExposureResponse } from './types.ts';

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
    // Inspect numeric lexemes before parsing can round them into safe-looking integers.
    const unquoted = text.replace(/"(?:[^"\\]|\\.)*"/g, '""');
    for (const match of unquoted.matchAll(/-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g)) {
      if (!/^-?\d+$/.test(match[0]) || BigInt(match[0]) > BigInt(Number.MAX_SAFE_INTEGER) || BigInt(match[0]) < BigInt(Number.MIN_SAFE_INTEGER)) throw new Error('Unsafe JSON number');
    }
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
  resolveInstrument(q: { venue: string; venue_market_id: OpaqueId; venue_outcome_id: OpaqueId }, opts?: RequestOptions): Promise<ResolveOut>;
  getInstrument(instrumentId: OpaqueId, opts?: RequestOptions & { include?: 'provenance' }): Promise<InstrumentOut>;
  getBasis(basisId: OpaqueId, opts?: RequestOptions): Promise<BasisOut>;
  postExposure(body: ExposureRequest, opts?: RequestOptions): Promise<ExposureResponse>;
}
export function createApiClient(init: { origin: ApiOrigin; fetch?: typeof fetch; now?: () => number }): ApiClient {
  const fetcher = init.fetch ?? globalThis.fetch;
  const request: ApiClient['request'] = async (method, path, options = {}) => {
    options.signal?.throwIfAborted();
    if (!init.origin.configured) throw new ApiError({ kind: 'not_configured' });
    const query = options.query ? '?' + new URLSearchParams(options.query).toString() : '';
    let response: Response;
    let text: string;
    try {
      response = await fetcher(init.origin.base + path + query, { method, headers: { Accept: 'application/json', ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }) }, signal: options.signal, body: options.body === undefined ? undefined : JSON.stringify(options.body) });
      text = await response.text();
    } catch (error) {
      options.signal?.throwIfAborted();
      if (error instanceof Error && error.name === 'AbortError') throw error;
      throw new ApiError({ kind: 'network' });
    }
    const requestId = response.headers.get('x-request-id');
    options.signal?.throwIfAborted();
    if (!response.ok) {
      let body: unknown;
      try { body = parseJsonLossless(text); } catch { /* Status remains useful when an upstream proxy returns plain text. */ }
      throw mapHttpError(response.status, body, response.headers, (init.now ?? Date.now)());
    }
    let body: unknown;
    try { body = parseJsonLossless(text); }
    catch { throw new ApiError({ kind: 'unexpected_response', status: response.status, requestId }); }
    if (typeof options.pinSnapshotId === 'string' && (!body || typeof body !== 'object' || !('snapshot_id' in body) || body.snapshot_id !== options.pinSnapshotId)) throw new ApiError({ kind: 'stale_version', status: response.status, requestId });
    return body as never;
  };
  return {
    origin: init.origin, request, getHealth: opts => request('GET', '/health', opts),
    resolveInstrument: (query, opts) => request('GET', '/v1/instruments:resolve', { ...opts, query }),
    getInstrument: (id, opts) => request('GET', '/v1/instruments/' + encodeURIComponent(id), { ...opts, query: opts?.include ? { include: opts.include } : undefined }),
    getBasis: (id, opts) => request('GET', '/v1/bases/' + encodeURIComponent(id), opts),
    postExposure: (body, opts) => {
      body.positions.forEach((position, index) => {
        if (!isDecimalString(position.quantity)) throw new TypeError(`positions[${index}].quantity must be a decimal string`);
        if (typeof position.market_id !== 'string' || typeof position.outcome_id !== 'string') throw new TypeError(`positions[${index}] IDs must be strings`);
      });
      return request('POST', '/v1/exposure', { ...opts, body });
    },
  };
}
