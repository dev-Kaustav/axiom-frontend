import { cp, rm, writeFile } from 'node:fs/promises';

await rm(new URL('../dist/', import.meta.url), { recursive: true, force: true });
await cp(new URL('../public/', import.meta.url), new URL('../dist/', import.meta.url), { recursive: true });
const apiOrigin = process.env.VITE_API_ORIGIN || '';
if (apiOrigin) {
  const url = new URL(apiOrigin);
  if (!['https:', 'http:'].includes(url.protocol) || url.origin !== apiOrigin || url.username || url.password) {
    throw new Error('VITE_API_ORIGIN must be an HTTP(S) origin without a path or credentials');
  }
}
await writeFile(new URL('../dist/config.js', import.meta.url),
  `window.ROOK_CONFIG = ${JSON.stringify({ apiOrigin }).replaceAll('<', '\\u003c')};\n`);
await cp(new URL('../demo/dist/', import.meta.url), new URL('../dist/demo/', import.meta.url), { recursive: true });
console.log('Rook landing page and demo built in dist/');
