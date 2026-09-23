// ============================================================================
// DEMO ACCESS GATE — Vercel Edge Middleware
//
// Runs before any file under /demo is served, so the JS, CSS, fonts and JSON
// are gated as well as the HTML. All the logic lives in demo-gate.mjs, which
// scripts/serve.mjs also imports, so local preview and production cannot drift.
//
// After the first deploy, confirm this actually ran:
//   curl -o /dev/null -w '%{http_code}\n' https://rook.pm/demo/assets/<bundle>.js
// It must print 401. If it prints 200, middleware is not running for this
// project type — use Vercel Deployment Protection > Password Protection.
// ============================================================================

import {
  basicAuthValid, cookieFrom, credentialsValid, GATE_HEADERS,
  loginPage, mintSession, sessionCookie, sessionValid,
} from './demo-gate.mjs';

export const config = { matcher: ['/demo', '/demo/:path*'] };

const isSecure = (request: Request) =>
  (request.headers.get('x-forwarded-proto') ?? new URL(request.url).protocol.replace(':', '')) === 'https';

function challenge(body: string, status = 401) {
  return new Response(body, { status, headers: GATE_HEADERS });
}

export default async function middleware(request: Request): Promise<Response | undefined> {
  const url = new URL(request.url);

  // A signed cookie, or Basic credentials for curl and CI.
  const admitted = await sessionValid(cookieFrom(request.headers.get('cookie')))
    || await basicAuthValid(request.headers.get('authorization'));

  if (request.method === 'POST') {
    let user = '', password = '';
    try {
      const form = await request.formData();
      user = String(form.get('user') ?? '');
      password = String(form.get('password') ?? '');
    } catch {
      return challenge(loginPage({ error: 'That sign-in could not be read. Please try again.', next: url.pathname }), 400);
    }

    if (!(await credentialsValid(user, password))) {
      return challenge(loginPage({ error: 'Those credentials were not recognised.', next: url.pathname }));
    }

    // Straight back to the demo, now carrying a session.
    return new Response(null, {
      status: 303,
      headers: {
        Location: url.pathname === '/demo' ? '/demo/' : url.pathname,
        'Set-Cookie': sessionCookie(await mintSession(), { secure: isSecure(request) }),
        'Cache-Control': 'no-store',
      },
    });
  }

  if (!admitted) return challenge(loginPage({ next: url.pathname }));

  return undefined;  // admitted: fall through to the static file
}
