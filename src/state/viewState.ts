import type { ApiOrigin } from '../api/client.ts';
import { ApiError, isApiError } from '../api/errors.ts';
export interface QuerySnapshot { status: 'pending' | 'error' | 'success'; error: unknown; hasData: boolean; isFetching: boolean; dataUpdatedAt: number; errorUpdatedAt: number; isEmpty?: boolean }
export interface ViewCopy { noun: string; loading: string; emptyHeading: string; emptyBody: string }
export type ViewState = { kind: 'loading' } | { kind: 'unavailable'; reason: 'not_configured' | 'capability' } | { kind: 'error'; error: ApiError };
export function deriveViewState(input: { origin: ApiOrigin; readiness: QuerySnapshot; data: QuerySnapshot | null }): ViewState {
  if (!input.origin.configured) return { kind: 'unavailable', reason: 'not_configured' };
  if (input.readiness.status === 'pending') return { kind: 'loading' };
  if (input.readiness.status === 'error' && !input.readiness.hasData) return { kind: 'error', error: isApiError(input.readiness.error) ? input.readiness.error : new ApiError({ kind: 'unexpected_response' }) };
  return { kind: 'unavailable', reason: 'capability' };
}
export interface StateContent { badge: string | null; heading: string; headingRole: 'status' | 'alert' | null; body: string | null; action: { label: string; disabled: boolean; busy: boolean } | null; reference: string | null }
export function describeViewState(state: ViewState, copy: ViewCopy, opts: { retrying?: boolean; nowMs?: number } = {}): StateContent {
  const content: StateContent = { badge: null, heading: '', headingRole: null, body: null, action: null, reference: null };
  if (state.kind === 'loading') return { ...content, heading: copy.loading, headingRole: 'status' };
  if (state.kind === 'unavailable') return { ...content, badge: 'NOT AVAILABLE', heading: state.reason === 'not_configured' ? 'Rook API not configured' : 'Not available on this server yet', body: state.reason === 'not_configured' ? 'This build has no API address, so no data can load. Set VITE_API_ORIGIN and rebuild.' : `This view needs ${copy.noun} from the Rook API, which this server doesn't provide yet.` };
  return { ...content, badge: 'ERROR', heading: `Couldn't load ${copy.noun}`, headingRole: 'alert', body: ['network', 'server_unavailable'].includes(state.error.kind) ? "The Rook API didn't respond. Check your connection, then reload." : `The server returned an unexpected response (${state.error.status ?? 'unknown'}). Reload, or try again later.`, action: { label: opts.retrying ? 'Reloading…' : 'Reload data', disabled: !!opts.retrying, busy: !!opts.retrying }, reference: state.error.requestId ? `Reference ${state.error.requestId}` : null };
}
