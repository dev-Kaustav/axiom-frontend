import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import middleware from '../middleware.ts';
import { COOKIE, mintSession } from '../demo-gate.mjs';

const keys = ['DEMO_USER', 'DEMO_PASSWORD', 'DEMO_PASSWORD_SHA256', 'DEMO_SESSION_SECRET'];
const previous = Object.fromEntries(keys.map(key => [key, process.env[key]]));

before(() => {
  process.env.DEMO_USER = 'test-user';
  process.env.DEMO_PASSWORD = 'test-password';
  delete process.env.DEMO_PASSWORD_SHA256;
  process.env.DEMO_SESSION_SECRET = 'test-only-session-key';
});

after(() => {
  for (const key of keys) {
    if (previous[key] === undefined) delete process.env[key];
    else process.env[key] = previous[key];
  }
});

const request = (path, options) => new Request(`https://example.test${path}`, options);
const sessionHeaders = async () => ({ cookie: `${COOKIE}=${await mintSession()}` });

test('launch shows sign-in even with a valid previous session', async () => {
  const response = await middleware(request('/demo', { headers: await sessionHeaders() }));
  assert.equal(response.status, 401);
  assert.match(await response.text(), /name="password"/);
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('signing in at the launch entry opens the workstation with a session', async () => {
  const response = await middleware(request('/demo', {
    method: 'POST',
    body: new URLSearchParams({ user: 'test-user', password: 'test-password' }),
  }));
  assert.equal(response.status, 303);
  assert.equal(response.headers.get('location'), '/demo/');
  const cookie = response.headers.get('set-cookie');
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  assert.equal(await middleware(request('/demo/', { headers: { cookie: cookie.split(';')[0] } })), undefined);
});

test('the workstation and assets remain accessible within an existing session', async () => {
  const headers = await sessionHeaders();
  for (const path of ['/demo/', '/demo/index.html', '/demo/assets/index.js']) {
    assert.equal(await middleware(request(path, { headers })), undefined);
  }
});

test('anonymous visitors cannot open the workstation or its assets', async () => {
  for (const path of ['/demo', '/demo/', '/demo/index.html', '/demo/assets/index.js']) {
    const response = await middleware(request(path));
    assert.equal(response.status, 401);
    assert.match(await response.text(), /name="password"/);
  }
});

test('incorrect credentials do not create a session', async () => {
  const response = await middleware(request('/demo', {
    method: 'POST',
    body: new URLSearchParams({ user: 'test-user', password: 'wrong-password' }),
  }));
  assert.equal(response.status, 401);
  assert.equal(response.headers.get('set-cookie'), null);
});

test('Basic credentials do not skip the launch sign-in screen', async () => {
  const headers = { authorization: `Basic ${Buffer.from('test-user:test-password').toString('base64')}` };
  assert.equal((await middleware(request('/demo', { headers }))).status, 401);
  assert.equal(await middleware(request('/demo/', { headers })), undefined);
});
