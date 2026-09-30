export type ApiErrorKind = 'not_configured' | 'network' | 'server_unavailable' | 'not_implemented'
  | 'not_found' | 'validation' | 'unresolved_account' | 'unsupported_scope' | 'expired_session'
  | 'rate_limited' | 'stale_version' | 'unexpected_response';
export interface ValidationIssue { readonly loc: readonly (string | number)[]; readonly msg: string; readonly type?: string }
export interface ApiErrorInit {
  kind: ApiErrorKind;
  status?: number | null;
  requestId?: string | null;
  detail?: string | null;
  issues?: readonly ValidationIssue[];
  retryAfterSeconds?: number | null;
}
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | null;
  readonly requestId: string | null;
  readonly detail: string | null;
  readonly issues: readonly ValidationIssue[];
  readonly retryAfterSeconds: number | null;
  constructor(init: ApiErrorInit) {
    super(init.detail ?? init.kind);
    this.name = 'ApiError';
    this.kind = init.kind;
    this.status = init.status ?? null;
    this.requestId = init.requestId ?? null;
    this.detail = init.detail ?? null;
    this.issues = init.issues ?? [];
    this.retryAfterSeconds = init.retryAfterSeconds ?? null;
  }
}
export function isApiError(value: unknown): value is ApiError { return value instanceof ApiError; }
export const RATE_LIMIT_DEFAULT_SECONDS = 30;
export function parseRetryAfter(header: string | null, nowMs: number): number | null {
  if (!header?.trim()) return null;
  if (/^\d+$/.test(header.trim())) {
    const seconds = Number(header);
    return Number.isSafeInteger(seconds) ? seconds : null;
  }
  const at = Date.parse(header);
  return Number.isFinite(at) ? Math.max(0, Math.ceil((at - nowMs) / 1000)) : null;
}
export function mapHttpError(status: number, body: unknown, headers: Headers, nowMs: number): ApiError {
  const object = body && typeof body === 'object' ? body as Record<string, unknown> : undefined;
  const detail = object?.detail;
  let kind: ApiErrorKind = 'unexpected_response';
  if (status === 400 || status === 422) kind = 'validation';
  else if (status === 401) kind = 'expired_session';
  else if (status === 404) kind = detail === 'Not Found' && Object.keys(object!).length === 1 ? 'not_implemented' : 'not_found';
  else if (status === 501) kind = 'not_implemented';
  else if (status === 409 || status === 412) kind = 'stale_version';
  else if (status === 429) kind = 'rate_limited';
  else if ([502, 503, 504].includes(status)) kind = 'server_unavailable';
  const issues: ValidationIssue[] = Array.isArray(detail) ? detail.filter((issue): issue is ValidationIssue => issue && typeof issue === 'object' && typeof issue.msg === 'string' && Array.isArray(issue.loc) && issue.loc.every((part: unknown) => typeof part === 'string' || typeof part === 'number')) : [];
  return new ApiError({ kind, status, requestId: headers.get('x-request-id'), detail: typeof detail === 'string' ? detail : null, issues, retryAfterSeconds: kind === 'rate_limited' ? parseRetryAfter(headers.get('retry-after'), nowMs) ?? RATE_LIMIT_DEFAULT_SECONDS : null });
}
