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
