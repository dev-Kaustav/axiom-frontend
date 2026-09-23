import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import {
  basicAuthValid, cookieFrom, credentialsValid, GATE_HEADERS,
  loginPage, mintSession, sessionCookie, sessionValid,
} from '../demo-gate.mjs';

const root = resolve(process.argv[2] || 'dist');
const port = Number(process.env.PORT || 4174);
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.txt': 'text/plain', '.xml': 'application/xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };

const gated = pathname => pathname === '/demo' || pathname.startsWith('/demo/');

const readBody = req => new Promise((done, fail) => {
  let raw = '';
  req.on('data', chunk => {
    raw += chunk;
    if (raw.length > 8192) { fail(new Error('body too large')); req.destroy(); }
  });
  req.on('end', () => done(raw));
  req.on('error', fail);
});

/** Mirrors middleware.ts. Returns true when the request has been answered. */
async function gate(req, res, pathname) {
  const admitted = await sessionValid(cookieFrom(req.headers.cookie))
    || await basicAuthValid(req.headers.authorization);

  if (req.method === 'POST') {
    let user = '', password = '';
    try {
      const form = new URLSearchParams(await readBody(req));
      user = form.get('user') ?? '';
      password = form.get('password') ?? '';
    } catch {
      res.writeHead(400, GATE_HEADERS).end(loginPage({ error: 'That sign-in could not be read. Please try again.', next: pathname }));
      return true;
    }
    if (!(await credentialsValid(user, password))) {
      res.writeHead(401, GATE_HEADERS).end(loginPage({ error: 'Those credentials were not recognised.', next: pathname }));
      return true;
    }
    res.writeHead(303, {
      location: pathname === '/demo' ? '/demo/' : pathname,
      'set-cookie': sessionCookie(await mintSession(), { secure: false }),
      'cache-control': 'no-store',
    }).end();
    return true;
  }

  if (!admitted) {
    res.writeHead(401, GATE_HEADERS).end(loginPage({ next: pathname }));
    return true;
  }
  return false;
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (gated(url.pathname) && await gate(req, res, url.pathname)) return;
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
