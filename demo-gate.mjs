// ============================================================================
// DEMO ACCESS GATE — shared by middleware.ts (Vercel edge) and scripts/serve.mjs
//
// The demo is a static bundle, so a password prompt drawn inside the demo page
// would be theatre: anyone could skip it by fetching /demo/assets/index-*.js
// and reading the portfolio and universe straight out of the bundle. The gate
// therefore sits in front of every request under /demo, HTML and assets alike.
//
// No database. A correct sign-in mints an HMAC-signed cookie carrying nothing
// but its own expiry, and the gate re-verifies that signature on each request.
//
//   DEMO_USER              username, default below
//   DEMO_PASSWORD          plaintext; hashed here for comparison
//   DEMO_PASSWORD_SHA256   or supply the hash directly
//   DEMO_SESSION_SECRET    HMAC key; falls back to the password hash
//
// Everything here runs on Web Crypto, which both the edge runtime and Node 22
// provide as a global, so the two callers share one implementation.
// ============================================================================

const DEFAULT_USER = 'axiom';
const DEFAULT_PASSWORD_SHA256 = '9c9ca90647d8773e1884ba42829750899bef886f0ba4b6dd522fdff292e5f20e';

export const COOKIE = 'rook_demo';
export const SESSION_SECONDS = 60 * 60 * 12;

const encoder = new TextEncoder();
const toHex = buffer => [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, '0')).join('');

async function sha256Hex(value) {
  return toHex(await crypto.subtle.digest('SHA-256', encoder.encode(value)));
}

async function hmacHex(secret, message) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return toHex(await crypto.subtle.sign('HMAC', key, encoder.encode(message)));
}

/** Compare two hex strings without leaking where they first differ. */
function constantTimeEquals(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const env = key => (typeof process !== 'undefined' ? process.env?.[key] : undefined) || '';

async function expectedPasswordHash() {
  const plaintext = env('DEMO_PASSWORD');
  if (plaintext) return sha256Hex(plaintext);
  return (env('DEMO_PASSWORD_SHA256') || DEFAULT_PASSWORD_SHA256).toLowerCase();
}

const expectedUser = () => env('DEMO_USER') || DEFAULT_USER;

// Signing key. Deriving it from the password hash means rotating the password
// also invalidates every session already handed out.
async function sessionSecret() {
  return env('DEMO_SESSION_SECRET') || `rook-demo-session:${await expectedPasswordHash()}`;
}

export async function credentialsValid(user, password) {
  if (typeof user !== 'string' || typeof password !== 'string') return false;
  const [userOk, passwordOk] = await Promise.all([
    (async () => constantTimeEquals(await sha256Hex(user), await sha256Hex(expectedUser())))(),
    (async () => constantTimeEquals(await sha256Hex(password), await expectedPasswordHash()))(),
  ]);
  return userOk && passwordOk;
}

/** `Authorization: Basic …` is kept alongside the form so curl and CI still work. */
export async function basicAuthValid(header) {
  const [scheme, encoded] = (header || '').split(' ');
  if (scheme?.toLowerCase() !== 'basic' || !encoded) return false;
  let decoded;
  try {
    decoded = typeof atob === 'function'
      ? atob(encoded)
      : Buffer.from(encoded, 'base64').toString('utf8');
  } catch { return false; }
  const separator = decoded.indexOf(':');           // only the first colon splits
  if (separator === -1) return false;
  return credentialsValid(decoded.slice(0, separator), decoded.slice(separator + 1));
}

export async function mintSession() {
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  return `${expires}.${await hmacHex(await sessionSecret(), String(expires))}`;
}

export async function sessionValid(value) {
  if (typeof value !== 'string') return false;
  const [expires, signature] = value.split('.');
  if (!expires || !signature) return false;
  if (!/^\d+$/.test(expires) || Number(expires) < Math.floor(Date.now() / 1000)) return false;
  return constantTimeEquals(signature, await hmacHex(await sessionSecret(), expires));
}

export function cookieFrom(header, name = COOKIE) {
  for (const part of (header || '').split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return undefined;
}

export function sessionCookie(value, { secure }) {
  return `${COOKIE}=${value}; Path=/demo; Max-Age=${SESSION_SECONDS}; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}`;
}

export const GATE_HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'Referrer-Policy': 'no-referrer',
};

const escapeHtml = value => String(value).replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/**
 * The sign-in page. Same palette, type and geometry as the landing page, so
 * the gate reads as part of the product rather than a browser interruption.
 */
export function loginPage({ error = '', next = '/demo/' } = {}) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#0a0a0c">
<title>Rook — Demo access</title>
<link rel="icon" type="image/svg+xml" href="/brand/rook.svg">
<style>
@font-face{font-family:Plex;src:url('/brand/plex-regular.woff2') format('woff2');font-weight:400;font-display:swap}
@font-face{font-family:Plex;src:url('/brand/plex-medium.woff2') format('woff2');font-weight:500 700;font-display:swap}
:root{color-scheme:dark;--bg:#0a0a0c;--panel:#151518;--line:#2c2c32;--line-strong:#3e3e46;
--t1:#f4f4f6;--t3:#adadb6;--t4:#94949e;--accent:#7c5cf5;--accent-soft:#977df7;--accent-cta:#7052ef;
--accent-fill:#7c5cf51f;--accent-line:#7c5cf566;--down:#ff6257;
--mono:ui-monospace,SFMono-Regular,Menlo,monospace}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:grid;place-items:center;padding:32px 20px;
font-family:Plex,system-ui,-apple-system,sans-serif;background:var(--bg);color:var(--t1);
-webkit-font-smoothing:antialiased;position:relative;overflow-x:hidden}
body::before{content:'';position:fixed;inset:0;pointer-events:none;
background:radial-gradient(60% 50% at 50% 12%,#7c5cf51f 0,transparent 70%),
linear-gradient(#ffffff08 1px,transparent 1px) 0 0/100% 72px,
linear-gradient(90deg,#ffffff08 1px,transparent 1px) 0 0/72px 100%;
mask-image:radial-gradient(70% 55% at 50% 22%,#000 0,transparent 78%)}
main{position:relative;width:min(404px,100%)}
.mark{display:flex;align-items:center;justify-content:center;gap:10px;font-size:27px;font-weight:600;
letter-spacing:-.055em;margin-bottom:28px}
.mark img{width:28px;height:28px}
.mark span{margin-left:-8px;color:var(--accent-soft)}
.card{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:34px 30px 30px;
box-shadow:0 0 0 1px #00000055,0 28px 60px -22px #000c,0 70px 120px -50px #7c5cf533}
.eyebrow{font-family:var(--mono);font-size:10px;letter-spacing:.11em;text-transform:uppercase;
color:var(--t4);display:flex;align-items:center;gap:9px;margin:0 0 18px}
.dot{width:6px;height:6px;border-radius:50%;background:var(--accent-soft);box-shadow:0 0 0 4px var(--accent-fill)}
h1{font-size:23px;font-weight:500;letter-spacing:-.02em;margin:0 0 10px}
.sub{font-size:13px;line-height:1.65;color:var(--t3);margin:0 0 26px}
label{display:block;font-family:var(--mono);font-size:10px;letter-spacing:.11em;text-transform:uppercase;
color:var(--t4);margin-bottom:8px}
input{width:100%;padding:12px 13px;font:inherit;font-size:14px;color:var(--t1);background:var(--bg);
border:1px solid var(--line-strong);border-radius:5px;transition:border-color .15s,box-shadow .15s}
input:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-fill)}
.field{margin-bottom:16px}
button{width:100%;margin-top:10px;padding:13px 16px;font:inherit;font-size:13px;color:#fff;cursor:pointer;
background:var(--accent-cta);border:1px solid var(--accent-cta);border-radius:5px;
transition:background .18s,transform .18s,box-shadow .18s}
button:hover{background:#8367ff;transform:translateY(-1px);box-shadow:0 10px 28px #7c5cf540}
button:active{transform:none}
.error{display:flex;gap:9px;align-items:flex-start;font-size:12.5px;line-height:1.5;color:#ffa39c;
background:#ff625714;border:1px solid #ff625759;border-radius:5px;padding:11px 13px;margin-bottom:20px}
.error b{color:var(--down);font-weight:500}
.note{font-size:11px;line-height:1.7;color:var(--t4);margin:22px 0 0;padding-top:18px;
border-top:1px solid var(--line)}
.back{display:block;text-align:center;margin-top:22px;font-size:12px;color:var(--t4);text-decoration:none}
.back:hover{color:var(--t3);text-decoration:underline;text-underline-offset:4px}
@media (max-width:420px){.card{padding:26px 20px 24px}h1{font-size:20px}}
</style>
</head>
<body>
<main>
  <div class="mark"><img src="/brand/rook.svg" width="28" height="28" alt="">rook<span>.</span></div>
  <form class="card" method="post" action="${escapeHtml(next)}">
    <p class="eyebrow"><span class="dot"></span>Private demo</p>
    <h1>Demo access</h1>
    <p class="sub">The Rook workstation demo is not public. Enter the credentials you were given to open it.</p>
    ${error ? `<p class="error"><b>&#9888;</b><span>${escapeHtml(error)}</span></p>` : ''}
    <div class="field">
      <label for="user">Username</label>
      <input id="user" name="user" type="text" autocomplete="username" autocapitalize="off"
             autocorrect="off" spellcheck="false" required autofocus>
    </div>
    <div class="field">
      <label for="password">Password</label>
      <input id="password" name="password" type="password" autocomplete="current-password" required>
    </div>
    <button type="submit">Open the workstation</button>
    <p class="note">Snapshot data over a fictional book. Research and simulation only &mdash; no account is
      connected and no order is ever executed.</p>
  </form>
  <a class="back" href="/">&larr; Back to rook.pm</a>
</main>
</body>
</html>`;
}
