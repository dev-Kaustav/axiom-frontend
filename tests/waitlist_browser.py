"""Run with Playwright and a landing preview at :4174, scratch API at :9001."""
from playwright.sync_api import sync_playwright, expect

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900}, reduced_motion="reduce")
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto('http://127.0.0.1:4174')
    page.wait_for_load_state('networkidle')
    expect(page.locator('.nav-cta')).to_have_attribute('href', '#waitlist')
    expect(page.locator('.hero-actions .button')).to_have_attribute('href', '#waitlist')
    expect(page.locator('.hero-actions .text-link')).to_have_attribute('href', '/demo')
    assert page.locator('#contact').evaluate('(e) => !!(e.compareDocumentPosition(document.getElementById("waitlist")) & Node.DOCUMENT_POSITION_FOLLOWING)')
    assert page.locator('#waitlist').evaluate('(e) => e.nextElementSibling === null')
    assert page.locator('html').evaluate('(e) => getComputedStyle(e).scrollBehavior') == 'auto'
    page.locator('.nav-cta').focus()
    page.keyboard.press('Enter')
    expect(page).to_have_url('http://127.0.0.1:4174/#waitlist')
    assert page.locator('.site-header').evaluate('(e) => getComputedStyle(e).position') == 'sticky'
    assert page.locator('#waitlist').bounding_box()['y'] >= page.locator('.site-header').bounding_box()['height']
    page.locator('#waitlist-name').fill('Browser Verification')
    page.locator('#waitlist-email').fill('rook-waitlist-check@example.com')
    submit = page.locator('#waitlist-form button')
    status = page.locator('#waitlist-status')
    # API acceptance and duplicate acceptance are exercised against scratch PostgreSQL.
    submit.click()
    expect(status).to_contain_text('You’re on the waitlist')
    submit.click()
    expect(status).to_contain_text('You’re on the waitlist')
    expect(page.locator('#waitlist-name')).to_have_value('Browser Verification')

    def mock_response(route, code, body, headers=None):
        route.fulfill(status=code, content_type='application/json', body=body, headers=headers or {})

    page.route('**/v1/waitlist', lambda r: mock_response(r, 422, '{"detail":[{"loc":["body","whatsapp"]}]}'))
    page.locator('#waitlist-country').select_option('IN')
    page.locator('#waitlist-whatsapp').fill('8528288484')
    submit.click()
    expect(status).to_contain_text('selected country')
    expect(page.locator('#waitlist-whatsapp')).to_be_focused()
    expect(page.locator('#waitlist-whatsapp')).to_have_value('8528288484')
    page.unroute('**/v1/waitlist')
    page.route('**/v1/waitlist', lambda r: mock_response(r, 429, '{}', {'Retry-After': '60'}))
    submit.click()
    expect(status).to_contain_text('wait 60 seconds')
    page.unroute('**/v1/waitlist')
    page.route('**/v1/waitlist', lambda r: mock_response(r, 503, '{}'))
    submit.click()
    expect(status).to_contain_text('temporarily unavailable')
    page.unroute('**/v1/waitlist')
    page.route('**/v1/waitlist', lambda r: r.abort())
    submit.click()
    expect(status).to_contain_text('Check your connection')
    page.unroute('**/v1/waitlist')
    # Hold a request open to check pending state and duplicate suppression.
    held = []
    page.route('**/v1/waitlist', lambda r: held.append(r))
    submit.click()
    expect(submit).to_be_disabled()
    page.locator('#waitlist-form').evaluate('(e) => e.dispatchEvent(new Event("submit", {cancelable: true}))')
    page.wait_for_timeout(100)
    assert len(held) == 1
    held[0].fulfill(status=202, content_type='application/json', body='{"status":"accepted"}')
    expect(status).to_contain_text('You’re on the waitlist')
    expect(submit).to_be_enabled()
    page.unroute('**/v1/waitlist')
    page.locator('#waitlist').screenshot(path='/private/tmp/rook-waitlist-desktop.png')
    for width in [390, 320]:
        page.set_viewport_size({'width': width, 'height': 844})
        page.locator('.nav-cta').click()
        expect(page.locator('.nav-cta')).to_be_visible()
        left = page.locator('.waitlist-copy').bounding_box()
        right = page.locator('.waitlist-form').bounding_box()
        assert right['y'] > left['y'] + left['height']
        assert right['x'] >= 0 and right['x'] + right['width'] <= width
        page.locator('#waitlist-name').focus()
        page.keyboard.press('Tab')
        expect(page.locator('#waitlist-email')).to_be_focused()
    page.locator('#waitlist').screenshot(path='/private/tmp/rook-waitlist-mobile.png')
    page.goto('http://127.0.0.1:4174/demo')
    assert page.locator('input[type="password"]').count() == 1
    assert errors == [], errors
    browser.close()
    print('PASS: anchors, sticky offset, keyboard, mobile, API acceptance/duplicate, submission states, demo gate')
