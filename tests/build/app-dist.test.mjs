import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
const output = new URL('../../.app-dist/', import.meta.url);
test('production emits independent app assets with deep-link-safe URLs', async () => {
  const html = await readFile(new URL('index.html', output), 'utf8');
  const assets = [...html.matchAll(/(?:src|href)="(\/app\/assets\/[^\"]+)"/g)].map(match => match[1]);
  assert.ok(assets.length);
  for (const asset of assets) await access(new URL(asset.slice('/app/'.length), output));
  assert.match(html, /href="\/favicon.png"/);
  assert.equal((html.match(/<script/g) ?? []).length, 1);
  assert.doesNotMatch(html, /demo\/|https?:\/\//);
});
