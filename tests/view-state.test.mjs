import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveViewState, describeViewState } from '../src/state/viewState.ts';
import { ApiError } from '../src/api/errors.ts';

const copy = { noun: 'portfolio exposure', loading: 'Loading exposure…', emptyHeading: 'No exposure to show', emptyBody: 'Exposure appears here once a portfolio has synced.' };
const success = { status: 'success', error: null, hasData: true, isFetching: false, dataUpdatedAt: 1000, errorUpdatedAt: 0 };
test('missing configuration and absent capability are distinct from a successful empty result', () => {
  assert.deepEqual(deriveViewState({ origin: { configured: false, raw: null }, readiness: success, data: null }), { kind: 'unavailable', reason: 'not_configured' });
  assert.deepEqual(deriveViewState({ origin: { configured: true, base: '/api' }, readiness: success, data: null }), { kind: 'unavailable', reason: 'capability' });
});
test('connection failure is actionable; pending readiness never looks empty', () => {
  for (const kind of ['network', 'server_unavailable']) {
    const error = new ApiError({ kind, status: kind === 'network' ? null : 502 });
    const state = deriveViewState({ origin: { configured: true, base: '/api' }, readiness: { ...success, status: 'error', hasData: false, error }, data: null });
    assert.equal(describeViewState(state, copy).action.label, 'Reload data');
    assert.match(describeViewState(state, copy).body, /didn't respond/);
  }
  assert.equal(deriveViewState({ origin: { configured: true, base: '/api' }, readiness: { ...success, status: 'pending', hasData: false }, data: null }).kind, 'loading');
});
test('refresh failure retains existing content and its original timestamp', () => {
  const data = { ...success, status: 'error', error: new ApiError({ kind: 'network' }), errorUpdatedAt: 2000 };
  const state = deriveViewState({ origin: { configured: true, base: '/api' }, readiness: success, data });
  assert.equal(state.kind, 'ready');
  assert.equal(state.stale.asOf, 1000);
});
test('a rate limit remains disabled until its retry deadline', () => {
  const state = deriveViewState({ origin: { configured: true, base: '/api' }, readiness: { ...success, status: 'error', hasData: false, error: new ApiError({ kind: 'rate_limited', retryAfterSeconds: 7 }), errorUpdatedAt: 1000 }, data: null });
  assert.equal(state.kind, 'rate_limited');
  assert.equal(describeViewState(state, copy, { nowMs: 1800 }).action.label, 'Retry in 7s');
  assert.equal(describeViewState(state, copy, { nowMs: 8000 }).action.disabled, false);
});
test('version mismatch invalidates retained results instead of presenting them as ready', () => {
  const data = { ...success, status: 'error', error: new ApiError({ kind: 'stale_version' }), errorUpdatedAt: 2000 };
  assert.equal(deriveViewState({ origin: { configured: true, base: '/api' }, readiness: success, data }).kind, 'stale_version');
});
