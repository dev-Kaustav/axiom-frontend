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
