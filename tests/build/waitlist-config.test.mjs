import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

test('static landing exposes only the environment-supplied API origin', async () => {
  const source = await readFile(new URL('../../dist/config.js', import.meta.url), 'utf8');
  const context = { window: {} };
  runInNewContext(source, context);
  assert.equal(context.window.ROOK_CONFIG.apiOrigin, process.env.VITE_API_ORIGIN || '');
  assert.deepEqual(Object.keys(context.window.ROOK_CONFIG), ['apiOrigin']);
  const html = await readFile(new URL('../../dist/index.html', import.meta.url), 'utf8');
  assert.ok(html.indexOf('/config.js') < html.indexOf('/brand/waitlist.js'));
});
