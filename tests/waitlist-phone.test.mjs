import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

test('country selector validates lengths and submits one complete international number', async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined,
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const errors = [];
    const requests = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/config.js', route => route.fulfill({
      contentType: 'text/javascript', body: 'window.ROOK_CONFIG = {apiOrigin: "https://waitlist-test.invalid"};',
    }));
    await page.route('**/v1/waitlist', route => {
      requests.push(route.request().postDataJSON());
      return route.fulfill({ status: 202, contentType: 'application/json', body: '{"status":"accepted"}' });
    });
    await page.goto(process.env.WAITLIST_PREVIEW_URL || 'http://127.0.0.1:4174/');
    const phone = page.locator('#waitlist-whatsapp');
    const country = page.locator('#waitlist-country');
    const submit = page.locator('#waitlist-form button[type="submit"]');
    await page.locator('#waitlist-name').fill('Phone validation check');
    await page.locator('#waitlist-email').fill('phone-check@example.com');
    assert.equal(await phone.getAttribute('placeholder'), 'Phone number');
    assert.equal(await country.inputValue(), 'US');
    assert.equal(await page.locator('#waitlist-dial-code').textContent(), '+1');
    assert.match(await page.locator('#waitlist-country-flag').getAttribute('src'), /\/us\.svg$/);
    assert.equal(await phone.getAttribute('maxlength'), '10');
    assert.ok(await country.locator('option').count() > 200);
    await submit.click();
    await page.waitForFunction(() => document.getElementById('waitlist-status').textContent.includes('You’re on'));
    assert.deepEqual(requests.at(-1), { name: 'Phone validation check', email: 'phone-check@example.com', whatsapp: null, website: '' });

    await country.selectOption('IN');
    await phone.fill('91234');
    await submit.click();
    assert.equal(requests.length, 1);
    assert.match(await page.locator('#waitlist-phone-error').textContent(), /10 digits for India/);
    assert.equal(await phone.getAttribute('aria-invalid'), 'true');
    await phone.fill('9123456789');
    await submit.click();
    await page.waitForFunction(() => !document.getElementById('waitlist-form').hasAttribute('aria-busy'));
    assert.equal(requests.at(-1).whatsapp, '+919123456789');
    assert.deepEqual(Object.keys(requests.at(-1)).sort(), ['email', 'name', 'website', 'whatsapp']);

    async function paste(value) {
      await phone.evaluate((input, text) => {
        input.select();
        const clipboardData = new DataTransfer();
        clipboardData.setData('text', text);
        input.dispatchEvent(new ClipboardEvent('paste', { clipboardData, bubbles: true, cancelable: true }));
      }, value);
    }
    await paste('91234567890');
    assert.equal(await phone.inputValue(), '91234567890');
    await submit.click();
    assert.equal(requests.length, 2);
    assert.match(await page.locator('#waitlist-phone-error').textContent(), /10 digits/);
    await paste('+44 7400 123456');
    assert.equal(await country.inputValue(), 'GB');
    assert.equal(await phone.inputValue(), '7400123456');
    assert.equal(await page.locator('#waitlist-dial-code').textContent(), '+44');
    await submit.click();
    await page.waitForFunction(() => !document.getElementById('waitlist-form').hasAttribute('aria-busy'));
    assert.equal(requests.at(-1).whatsapp, '+447400123456');
    await phone.fill('');
    await phone.pressSequentially('07400123456');
    assert.equal(await phone.inputValue(), '7400123456');

    await country.selectOption('AU');
    assert.equal(await phone.getAttribute('maxlength'), '9');
    assert.equal(await phone.inputValue(), '7400123456');
    await submit.click();
    assert.equal(requests.length, 3);
    await paste('+61 412 345 678');
    assert.equal(await phone.inputValue(), '412345678');
    await submit.click();
    await page.waitForFunction(() => !document.getElementById('waitlist-form').hasAttribute('aria-busy'));
    assert.equal(requests.at(-1).whatsapp, '+61412345678');

    // Wrong-length and wrong-country numbers stay editable without a request.
    await country.selectOption('IN');
    await phone.fill('1111111111');
    await submit.click();
    assert.equal(requests.length, 4);
    assert.match(await page.locator('#waitlist-phone-error').textContent(), /Check the phone number/);
    await phone.fill('');
    await page.locator('#waitlist-email').focus();
    await page.keyboard.press('Tab');
    assert.equal(await country.evaluate(element => element === document.activeElement), true);
    await page.keyboard.press('Tab');
    assert.equal(await phone.evaluate(element => element === document.activeElement), true);
    assert.equal(await page.locator('#waitlist-country-flag').evaluate(image => image.complete && image.naturalWidth > 0), true);

    // The prefix and number share one border and fit narrow and landscape views.
    for (const [width, height] of [[1440, 900], [375, 812], [320, 844], [844, 390]]) {
      await page.setViewportSize({ width, height });
      const box = await page.locator('.phone-field').boundingBox();
      assert.ok(box.x >= 0 && box.x + box.width <= width);
      assert.ok(await phone.evaluate(input => input.clientWidth >= 90));
      assert.ok(await country.evaluate(select => select.clientHeight >= 44));
      await page.locator('#waitlist-form').screenshot({ path: `/private/tmp/rook-phone-${width}.png` });
    }
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
  }
});
