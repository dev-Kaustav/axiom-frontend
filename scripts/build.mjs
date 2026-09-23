import { cp, rm } from 'node:fs/promises';

await rm(new URL('../dist/', import.meta.url), { recursive: true, force: true });
await cp(new URL('../public/', import.meta.url), new URL('../dist/', import.meta.url), { recursive: true });
await cp(new URL('../demo/dist/', import.meta.url), new URL('../dist/demo/', import.meta.url), { recursive: true });
console.log('Rook landing page and demo built in dist/');
