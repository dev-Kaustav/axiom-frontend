import { cp, rm, writeFile } from 'node:fs/promises';

const apiOrigin = process.env.VITE_API_ORIGIN || '';
if (process.env.VERCEL_ENV === 'production' && !apiOrigin) {
  throw new Error('Set VITE_API_ORIGIN in the Vercel Production environment before deploying the waitlist');
}
if (apiOrigin) {
  const url = new URL(apiOrigin);
  if (!['https:', 'http:'].includes(url.protocol) || url.origin !== apiOrigin || url.username || url.password) {
    throw new Error('VITE_API_ORIGIN must be an HTTP(S) origin without a path or credentials');
  }
}
await rm(new URL('../dist/', import.meta.url), { recursive: true, force: true });
await cp(new URL('../public/', import.meta.url), new URL('../dist/', import.meta.url), { recursive: true });
const { buildPhoneAssets } = await import('./build-phone-assets.mjs');
await buildPhoneAssets(new URL('../dist/brand/phone/', import.meta.url));
await writeFile(new URL('../dist/config.js', import.meta.url),
  `window.ROOK_CONFIG = ${JSON.stringify({ apiOrigin }).replaceAll('<', '\\u003c')};\n`);
await cp(new URL('../demo/dist/', import.meta.url), new URL('../dist/demo/', import.meta.url), { recursive: true });
console.log('Rook landing page and demo built in dist/');
