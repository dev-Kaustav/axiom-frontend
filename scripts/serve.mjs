import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

const root = resolve(process.argv[2] || 'public');
const port = Number(process.env.PORT || 4174);
const { rewrites } = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
const types = { '.html': 'text/html', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.txt': 'text/plain', '.xml': 'application/xml' };

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    // Mirror the Vercel proxy locally; the demo stays in its own project.
    for (const route of rewrites) {
      const wildcard = route.source.endsWith('/:path*');
      const prefix = wildcard ? route.source.slice(0, -7) : route.source;
      if (url.pathname !== prefix && !(wildcard && url.pathname.startsWith(`${prefix}/`))) continue;
      const tail = url.pathname.slice(prefix.length).replace(/^\//, '');
      const upstream = await fetch(route.destination.replace(':path*', tail) + url.search);
      res.writeHead(upstream.status, { 'content-type': upstream.headers.get('content-type') || 'application/octet-stream' });
      res.end(Buffer.from(await upstream.arrayBuffer()));
      return;
    }
    const path = resolve(root, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
    if (!path.startsWith(root + sep)) { res.writeHead(403).end('Forbidden'); return; }
    const body = await readFile(path);
    res.writeHead(200, { 'content-type': types[extname(path)] || 'application/octet-stream' });
    res.end(body);
  } catch (error) {
    const notFound = error.code === 'ENOENT' || error.code === 'EISDIR';
    res.writeHead(notFound ? 404 : 502).end(notFound ? 'Not found' : 'Unable to load the demo. Check your connection and its Vercel deployment.');
  }
}).listen(port, '127.0.0.1', () => console.log(`Rook: http://127.0.0.1:${port}`));
