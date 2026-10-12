import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const base = process.env.DEMO_REQUEST_PREVIEW_URL || 'http://127.0.0.1:4174';

test('demo request collects only email and preserves failures before confirmed success', async () => {
  const browser = await chromium.launch({ headless: true,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const errors = [];
    const requests = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/config.js', route => route.fulfill({ contentType: 'text/javascript',
      body: 'window.ROOK_CONFIG = {apiOrigin: "https://demo-test.invalid"};' }));
    let result = { status: 422, body: '{"detail":[]}' };
    let hold;
    let release;
    await page.route('**/v1/demo-requests', async route => {
      requests.push(route.request().postDataJSON());
      if (hold) await hold;
      if (result.abort) return route.abort();
      return route.fulfill({ contentType: 'application/json', ...result,
        headers: { 'Access-Control-Expose-Headers': 'Retry-After', ...result.headers } });
    });
    await page.goto(base);
    const waitlistLink = page.locator('.header-actions a[href="#waitlist"]');
    assert.match(await waitlistLink.textContent(), /Join the waitlist/);
    for (const [width, height] of [[1440, 900], [1241, 900], [1100, 900], [375, 812], [320, 844]]) {
      await page.setViewportSize({ width, height });
      for (const action of await page.locator('.header-actions a').all()) {
        assert.ok(await action.isVisible());
        const box = await action.boundingBox();
        assert.ok(box.x >= 0 && box.x + box.width <= width);
      }
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.locator('.nav-cta[href="/request-demo"]').click();
    assert.match(page.url(), /\/request-demo$/);
    assert.equal(await page.locator('input').count(), 1);
    const email = page.locator('#demo-email');
    const submit = page.locator('#demo-request-form button');
    const status = page.locator('#demo-status');
    await submit.click();
    assert.match(await status.textContent(), /valid email/);
    assert.equal(requests.length, 0);
    await email.fill('invalid');
    await submit.click();
    assert.equal(requests.length, 0);
    await email.fill('ada@example.com');

    for (const [response, message] of [
      [{ status: 422, body: '{"detail":[]}' }, /valid email/],
      [{ status: 429, headers: { 'Retry-After': '17' }, body: '{}' }, /17 seconds/],
      [{ status: 503, body: '{}' }, /could not confirm/],
      [{ status: 202, body: '{"status":"unexpected"}' }, /could not confirm/],
      [{ abort: true }, /Could not connect/],
    ]) {
      result = response;
      await submit.click();
      await page.waitForFunction(() => !document.getElementById('demo-request-form').hasAttribute('aria-busy'));
      assert.match(await status.textContent(), message);
      assert.equal(await email.inputValue(), 'ada@example.com');
      assert.equal(await page.locator('#demo-success').isVisible(), false);
    }

    for (const [width, height] of [[1440, 900], [375, 812], [320, 844], [844, 390]]) {
      await page.setViewportSize({ width, height });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.locator('.demo-request-card').screenshot({ path: `/private/tmp/rook-request-demo-${width}.png` });
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    result = { status: 202, body: '{"status":"accepted"}' };
    hold = new Promise(resolve => { release = resolve; });
    const previous = requests.length;
    await submit.click();
    await page.waitForFunction(() => document.getElementById('demo-request-form').hasAttribute('aria-busy'));
    assert.ok(await submit.isDisabled());
    assert.ok(await email.evaluate(input => input.readOnly));
    await page.locator('#demo-request-form').evaluate(form => form.dispatchEvent(new Event('submit', { cancelable: true })));
    release();
    await page.locator('#demo-success').waitFor({ state: 'visible' });
    assert.equal(requests.length, previous + 1);
    assert.deepEqual(requests.at(-1), { email: 'ada@example.com' });
    assert.equal(await page.locator('#demo-request-form').isVisible(), false);
    assert.ok(await page.locator('#demo-success h2').evaluate(heading => heading === document.activeElement));
    assert.deepEqual(errors, []);
    await page.goto(`${base}/request-demo/`);
    assert.equal(await email.isVisible(), true);
    await page.goto(`${base}/demo`);
    assert.equal(await page.locator('input[type="password"]').count(), 1);
  } finally {
    await browser.close();
  }
});

test('missing API configuration does not claim a saved request', async () => {
  const browser = await chromium.launch({ headless: true,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined });
  try {
    const page = await browser.newPage();
    await page.route('**/config.js', route => route.fulfill({ contentType: 'text/javascript', body: 'window.ROOK_CONFIG = {apiOrigin: ""};' }));
    await page.goto(`${base}/request-demo`);
    await page.locator('#demo-email').fill('ada@example.com');
    await page.locator('#demo-request-form button').click();
    assert.match(await page.locator('#demo-status').textContent(), /unavailable/);
    assert.equal(await page.locator('#demo-success').isVisible(), false);
  } finally {
    await browser.close();
  }
});
