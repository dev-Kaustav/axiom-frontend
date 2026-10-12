import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { runInNewContext } from 'node:vm';

async function buildFixture(t, environment) {
  const root = await mkdtemp(join(tmpdir(), 'rook-waitlist-build-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const directory of ['scripts', 'public', 'demo/dist', 'dist']) {
    await mkdir(join(root, directory), { recursive: true });
  }
  await cp(new URL('../../scripts/build.mjs', import.meta.url), join(root, 'scripts/build.mjs'));
  await cp(new URL('../../scripts/build-phone-assets.mjs', import.meta.url), join(root, 'scripts/build-phone-assets.mjs'));
  await symlink(new URL('../../node_modules/', import.meta.url).pathname, join(root, 'node_modules'), 'dir');
  await writeFile(join(root, 'public/index.html'), '<html>Landing</html>');
  await writeFile(join(root, 'demo/dist/index.html'), '<html>Demo</html>');
  await writeFile(join(root, 'dist/previous-build.txt'), 'preserve on configuration failure');
  const result = spawnSync(process.execPath, [join(root, 'scripts/build.mjs')], {
    env: { ...process.env, VERCEL_ENV: '', VITE_API_ORIGIN: '', ...environment },
    encoding: 'utf8',
  });
  return { root, result };
}

test('production rejects a missing waitlist API origin before removing existing output', async t => {
  const { root, result } = await buildFixture(t, { VERCEL_ENV: 'production' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Set VITE_API_ORIGIN in the Vercel Production environment/);
  assert.equal(await readFile(join(root, 'dist/previous-build.txt'), 'utf8'),
    'preserve on configuration failure');
});

test('production publishes the configured waitlist API and includes the demo', async t => {
  const { root, result } = await buildFixture(t, {
    VERCEL_ENV: 'production', VITE_API_ORIGIN: 'https://api.rook.pm',
  });
  assert.equal(result.status, 0, result.stderr);
  const context = { window: {} };
  runInNewContext(await readFile(join(root, 'dist/config.js'), 'utf8'), context);
  assert.equal(context.window.ROOK_CONFIG.apiOrigin, 'https://api.rook.pm');
  assert.equal(await readFile(join(root, 'dist/demo/index.html'), 'utf8'), '<html>Demo</html>');
});

test('local previews still build without a waitlist API origin', async t => {
  const { root, result } = await buildFixture(t, {});
  assert.equal(result.status, 0, result.stderr);
  const context = { window: {} };
  runInNewContext(await readFile(join(root, 'dist/config.js'), 'utf8'), context);
  assert.equal(context.window.ROOK_CONFIG.apiOrigin, '');
});
