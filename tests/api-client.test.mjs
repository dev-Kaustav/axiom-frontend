import test from 'node:test';
import assert from 'node:assert/strict';
import { createApiClient, parseApiOrigin, parseJsonLossless } from '../src/api/client.ts';
import { ApiError } from '../src/api/errors.ts';
import { createAppQueryClient, healthQueryOptions, shouldRetry } from '../src/api/queries.ts';
const origin = parseApiOrigin('/api');
const huge = '9'.repeat(78);
test('rejects non-integer number lexemes before JSON parsing can round them', () => {
  for (const text of ['{"x":0.1}', '{"x":1.00000000000000001}', '{"x":9007199254740993}', '{"x":1e400}']) {
    assert.throws(() => parseJsonLossless(text), error => error.kind === 'unexpected_response');
  }
  assert.deepEqual(parseJsonLossless('{"x":"1E-7","id":"' + huge + '","count":1}'), { x: '1E-7', id: huge, count: 1 });
});
test('outgoing and incoming decimal strings and IDs stay unchanged', async () => {
  for (const quantity of ['0.000001', '1E-7', '-12345678901234567890.123456789']) {
    const body = { positions: [{ venue: 'polymarket', market_id: huge, outcome_id: huge, quantity }] };
    const api = createApiClient({ origin, fetch: async (url, init) => {
      assert.equal(url, '/api/v1/exposure');
      assert.deepEqual(JSON.parse(init.body), body);
      return new Response(JSON.stringify(body));
    } });
    assert.deepEqual(await api.postExposure(body), body);
    assert.throws(() => api.postExposure({ positions: [{ ...body.positions[0], quantity: 1 }] }), TypeError);
  }
});
test('error classification keeps HTTP status, request ID, validation issues and retry delay', async () => {
  const cases = [[400, 'bad', 'validation'], [422, [{ loc: ['body', 'quantity'], msg: 'invalid', type: 'value_error' }], 'validation'], [401, 'no session', 'expired_session'], [404, 'Not Found', 'not_implemented'], [404, 'unknown basis abc', 'not_found'], [409, 'changed', 'stale_version'], [412, 'changed', 'stale_version'], [429, 'wait', 'rate_limited'], [501, 'missing', 'not_implemented'], [502, undefined, 'server_unavailable']];
  for (const [status, detail, kind] of cases) {
    const api = createApiClient({ origin, fetch: async () => new Response(detail === undefined ? '' : JSON.stringify({ detail }), { status, headers: { 'x-request-id': huge, 'retry-after': '7' } }) });
    await assert.rejects(api.getHealth(), error => error instanceof ApiError && error.kind === kind && error.status === status && error.requestId === huge && (status !== 429 || error.retryAfterSeconds === 7) && (status !== 422 || error.issues[0].msg === 'invalid'));
  }
});
test('snapshot mismatch and cancellation never return late data', async () => {
  const api = createApiClient({ origin, fetch: async () => new Response('{"snapshot_id":"new"}') });
  await assert.rejects(api.request('GET', '/health', { pinSnapshotId: 'old' }), error => error.kind === 'stale_version');
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(api.getHealth({ signal: controller.signal }), error => error.name === 'AbortError');
  const late = new AbortController();
  const lateApi = createApiClient({ origin, fetch: async () => { late.abort(); return new Response('{}'); } });
  await assert.rejects(lateApi.getHealth({ signal: late.signal }), error => error.name === 'AbortError');
});
test('missing origin makes no request, retry is bounded, and concurrent reads deduplicate', async () => {
  let calls = 0;
  const api = createApiClient({ origin, fetch: async () => { calls++; return new Response('{}'); } });
  const client = createAppQueryClient();
  await Promise.all([client.fetchQuery(healthQueryOptions(api)), client.fetchQuery(healthQueryOptions(api))]);
  assert.equal(calls, 1);
  client.clear();
  for (const kind of ['network', 'server_unavailable']) {
    assert.equal(shouldRetry(0, new ApiError({ kind })), true);
    assert.equal(shouldRetry(1, new ApiError({ kind })), false);
  }
  assert.equal(shouldRetry(0, new ApiError({ kind: 'rate_limited' })), false);
  for (const raw of ['', '//evil.test', '/\\evil.test', 'https://user:secret@example.com', 'https://example.com?key=secret']) assert.equal(parseApiOrigin(raw).configured, false);
  await assert.rejects(createApiClient({ origin: parseApiOrigin(''), fetch: async () => { throw new Error('must not fetch'); } }).getHealth(), error => error.kind === 'not_configured');
});
