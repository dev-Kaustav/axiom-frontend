import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

const root = resolve(process.argv[2] || 'dist');
const port = Number(process.env.PORT || 4174);
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.txt': 'text/plain', '.xml': 'application/xml' };

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const pathname = url.pathname === '/' ? '/index.html' :
      ['/demo', '/demo/'].includes(url.pathname) ? '/demo/index.html' : url.pathname;
    const path = resolve(root, '.' + decodeURIComponent(pathname));
    if (!path.startsWith(root + sep)) { res.writeHead(403).end('Forbidden'); return; }
    const body = await readFile(path);
    res.writeHead(200, { 'content-type': types[extname(path)] || 'application/octet-stream' });
    res.end(body);
  } catch (error) {
    const notFound = error.code === 'ENOENT' || error.code === 'EISDIR';
    res.writeHead(notFound ? 404 : 500).end(notFound ? 'Not found' : 'Unable to read the requested file.');
  }
}).listen(port, '127.0.0.1', () => console.log(`Rook: http://127.0.0.1:${port}`));
