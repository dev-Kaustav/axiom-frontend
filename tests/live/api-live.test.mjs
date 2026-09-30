import test from 'node:test';
import assert from 'node:assert/strict';
import { createApiClient, parseApiOrigin } from '../../src/api/client.ts';
if (!process.env.AXIOM_API_URL) throw new Error('AXIOM_API_URL is required (start axiom-backend first)');
const api = createApiClient({ origin: parseApiOrigin(process.env.AXIOM_API_URL) });
test('real backend readiness retains status, snapshot and safe counts', async () => {
  const result = await api.getHealth();
  assert.ok(['ok', 'not_ready'].includes(result.status));
  assert.ok(result.snapshot_id === null || typeof result.snapshot_id === 'string');
  for (const key of ['admitted_instruments', 'observables', 'instruments', 'bases']) assert.ok(Number.isSafeInteger(result[key]));
});
test('real exposure preserves venue IDs and decimal quantities', async () => {
  const id = '9'.repeat(78);
  for (const quantity of ['0.000001', '-12345678901234567890.123456789']) {
    const result = await api.postExposure({ positions: [{ venue: 'polymarket', market_id: id, outcome_id: id, quantity }] });
    assert.equal(result.unresolved[0].market_id, id);
    assert.equal(result.unresolved[0].outcome_id, id);
    assert.equal(result.unresolved[0].quantity, quantity);
  }
  await assert.rejects(api.postExposure({ positions: [] }), error => error.kind === 'validation' && error.status === 400);
  await assert.rejects(api.getBasis('axf-unknown'), error => error.kind === 'not_found');
  await assert.rejects(api.request('GET', '/v1/axf-absent'), error => error.kind === 'not_implemented');
  await assert.rejects(api.getHealth({ pinSnapshotId: 'axf-impossible-snapshot' }), error => error.kind === 'stale_version');
});
