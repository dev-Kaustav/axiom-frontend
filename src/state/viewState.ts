import type { ApiOrigin } from '../api/client.ts';
import { ApiError, isApiError } from '../api/errors.ts';
import { formatUtcTimestamp } from '../format/time.ts';
export interface QuerySnapshot { status: 'pending' | 'error' | 'success'; error: unknown; hasData: boolean; isFetching: boolean; dataUpdatedAt: number; errorUpdatedAt: number; isEmpty?: boolean }
export interface ViewCopy { noun: string; loading: string; emptyHeading: string; emptyBody: string }
export type ViewState = { kind: 'loading' | 'empty' }
  | { kind: 'unavailable'; reason: 'not_configured' | 'capability' }
  | { kind: 'error' | 'stale_version' | 'unsupported_scope' | 'expired_session' | 'unresolved_account'; error: ApiError }
  | { kind: 'rate_limited'; error: ApiError; retryAt: number }
  | { kind: 'ready'; stale: { asOf: number; error: ApiError; retryAt?: number } | null };
function errorState(query: QuerySnapshot): ViewState {
  const error = isApiError(query.error) ? query.error : new ApiError({ kind: 'unexpected_response' });
  if (error.kind === 'not_configured') return { kind: 'unavailable', reason: 'not_configured' };
  if (error.kind === 'not_implemented') return { kind: 'unavailable', reason: 'capability' };
  if (error.kind === 'rate_limited') return { kind: 'rate_limited', error, retryAt: query.errorUpdatedAt + (error.retryAfterSeconds ?? 30) * 1000 };
  if (error.kind === 'stale_version' || error.kind === 'unsupported_scope' || error.kind === 'expired_session' || error.kind === 'unresolved_account') return { kind: error.kind, error };
  return { kind: 'error', error };
}
export function deriveViewState(input: { origin: ApiOrigin; readiness: QuerySnapshot; data: QuerySnapshot | null }): ViewState {
  if (!input.origin.configured) return { kind: 'unavailable', reason: 'not_configured' };
  if (input.readiness.status === 'pending' && !input.readiness.hasData) return { kind: 'loading' };
  if (input.readiness.status === 'error' && !input.readiness.hasData) return errorState(input.readiness);
  if (!input.data) return input.readiness.error ? errorState(input.readiness) : { kind: 'unavailable', reason: 'capability' };
  const data = input.data;
  const failure = data.error ? errorState(data) : null;
  // A changed snapshot or expired identity invalidates the retained result.
  if (failure && ['stale_version', 'expired_session', 'unresolved_account', 'unsupported_scope', 'unavailable'].includes(failure.kind)) return failure;
  if (data.hasData) {
    if (data.error) {
      const error = isApiError(data.error) ? data.error : new ApiError({ kind: 'unexpected_response' });
      return { kind: 'ready', stale: { asOf: data.dataUpdatedAt, error, retryAt: failure?.kind === 'rate_limited' ? failure.retryAt : undefined } };
    }
    return data.isEmpty ? { kind: 'empty' } : { kind: 'ready', stale: null };
  }
  if (failure) return failure;
  return { kind: 'loading' };
}
export interface StateContent { badge: string | null; heading: string; headingRole: 'status' | 'alert' | null; body: string | null; action: { label: string; disabled: boolean; busy: boolean } | null; reference: string | null }
export function describeViewState(state: ViewState, copy: ViewCopy, opts: { retrying?: boolean; nowMs?: number } = {}): StateContent {
  const content: StateContent = { badge: null, heading: '', headingRole: null, body: null, action: null, reference: null };
  if (state.kind === 'loading') return { ...content, heading: copy.loading, headingRole: 'status' };
  if (state.kind === 'empty') return { ...content, heading: copy.emptyHeading, body: copy.emptyBody };
  if (state.kind === 'ready') return content;
  if (state.kind === 'unavailable') return { ...content, badge: 'NOT AVAILABLE', heading: state.reason === 'not_configured' ? 'Rook API not configured' : 'Not available on this server yet', body: state.reason === 'not_configured' ? 'This build has no API address, so no data can load. Set VITE_API_ORIGIN and rebuild.' : `This view needs ${copy.noun} from the Rook API, which this server doesn't provide yet.` };
  const action = retryLabel({ retrying: opts.retrying, retryAt: state.kind === 'rate_limited' ? state.retryAt : undefined, nowMs: opts.nowMs });
  const reference = state.error.requestId ? `Reference ${state.error.requestId}` : null;
  if (state.kind === 'rate_limited') return { ...content, badge: 'RATE LIMITED', heading: 'Too many requests', body: 'The server asked Rook to wait before trying again.', action, reference };
  if (state.kind === 'stale_version') return { ...content, badge: 'OUTDATED', heading: 'This data has changed', body: 'A newer version is available on the server. Reload to see current results.', action, reference };
  if (state.kind === 'unsupported_scope') return { ...content, heading: "This scope isn't supported", body: 'Choose another family from the catalog.', reference };
  if (state.kind === 'expired_session') return { ...content, heading: 'Your session has ended', body: 'Sign in again to see your saved workspace.', reference };
  if (state.kind === 'unresolved_account') return { ...content, heading: 'Polymarket account could not be resolved', body: 'Check the address and try again.', reference };
  return { ...content, badge: 'ERROR', heading: `Couldn't load ${copy.noun}`, headingRole: 'alert', body: ['network', 'server_unavailable'].includes(state.error.kind) ? "The Rook API didn't respond. Check your connection, then reload." : `The server returned an unexpected response (${state.error.status ?? 'unknown'}). Reload, or try again later.`, action, reference };
}
export function retryLabel(opts: { retrying?: boolean; retryAt?: number; nowMs?: number }): NonNullable<StateContent['action']> {
  const remaining = Math.max(0, Math.ceil(((opts.retryAt ?? 0) - (opts.nowMs ?? Date.now())) / 1000));
  return { label: opts.retrying ? 'Reloading…' : remaining ? `Retry in ${remaining}s` : 'Reload data', disabled: !!opts.retrying || remaining > 0, busy: !!opts.retrying };
}
export function staleBannerText(asOf: number) { return `Refresh failed — showing data from ${formatUtcTimestamp(asOf)} UTC.`; }
