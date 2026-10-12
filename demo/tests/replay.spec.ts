import { expect, test } from '@playwright/test';

test('Exposure marks move in two seconds while settlement stays fixed, and the feed follows navigation', async ({ page }) => {
  await page.goto('/demo/');
  const market = page.getByTestId('market-value');
  const start = await market.innerText();
  const settlement = await page.locator('.diagnosis-action, .exposure-metrics, .heatmap, .outcome-readout, .outcome-facts').allInnerTexts();
  await expect.poll(() => market.innerText(), { timeout: 2000 }).not.toBe(start);
  expect(await page.locator('.diagnosis-action, .exposure-metrics, .heatmap, .outcome-readout, .outcome-facts').allInnerTexts()).toEqual(settlement);
  await page.getByRole('button', { name: 'Pause feed', exact: true }).click();
  const frozen = await market.innerText();
  await page.getByRole('button', { name: 'Terminal', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Resume feed', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Exposure', exact: true }).click();
  expect(await market.innerText()).toBe(frozen);
  await page.getByRole('button', { name: 'Protect this outcome', exact: true }).click();
  await expect(page.locator('.target-banner')).toBeVisible();
});

test('pause, resume, restart and hidden-tab suspension preserve the complete replay', async ({ page }) => {
  await page.goto('/demo/?feed=paused#/terminal');
  const read = () => page.locator('.quotes-table tbody, .replay-chart, .book-table, .tape-table tbody, .wire-list').allInnerTexts();
  const initial = await read();
  await page.waitForTimeout(1100);
  expect(await read()).toEqual(initial);
  await page.getByRole('button', { name: 'Resume feed', exact: true }).click();
  await expect.poll(read, { timeout: 2000 }).not.toEqual(initial);
  await page.getByRole('button', { name: 'Pause feed', exact: true }).click();
  const frozen = await read();
  await page.waitForTimeout(1100);
  expect(await read()).toEqual(frozen);
  await page.getByRole('button', { name: 'Restart session', exact: true }).click();
  expect(await read()).toEqual(initial);
  await page.getByRole('button', { name: 'Resume feed', exact: true }).click();
  await page.evaluate(() => Object.defineProperty(document, 'hidden', { configurable: true, value: true }));
  const hidden = await read();
  await page.waitForTimeout(1100);
  expect(await read()).toEqual(hidden);
  await page.evaluate(() => Object.defineProperty(document, 'hidden', { configurable: true, value: false }));
  await expect.poll(read, { timeout: 2000 }).not.toEqual(hidden);
  await page.getByRole('button', { name: 'Restart session', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pause feed', exact: true })).toBeVisible();
});

test('selection links quotes, candles, side and catalysts, including keyboard chart review', async ({ page }) => {
  await page.goto('/demo/?feed=paused#/terminal');
  const row = page.locator('.quotes-table tbody tr').nth(2);
  const name = await row.locator('.quote-name').innerText();
  await row.locator('.quote-name').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.chart-contract, .book-summary')).toContainText([name, name]);
  await page.getByRole('group', { name: 'Book side' }).getByRole('button', { name: 'NO', exact: true }).click();
  await expect(page.locator('.replay-chart')).toHaveAttribute('data-side', 'NO');
  const readout = page.locator('.candle-readout');
  const latest = await readout.innerText();
  await page.locator('.replay-chart svg').focus();
  await page.keyboard.press('ArrowLeft');
  await expect(readout).not.toHaveText(latest);
  await page.locator('.wire-contracts button').first().click();
  const id = await page.locator('.replay-chart').getAttribute('data-contract');
  expect(id).toBeTruthy();
  await expect(page.locator('.quote-name[aria-pressed=true]')).toHaveCount(1);
  await expect(page.locator('.book-summary .side-label')).toHaveText('NO');
});

test('tape and wire preserve review entries and scroll positions while live', async ({ page }) => {
  await page.goto('/demo/#/terminal');
  for (const label of ['Time and sales', 'News wire']) {
    const region = page.locator(`.term-body[aria-label="${label}"]`);
    await region.evaluate(el => { el.scrollTop = 100; });
    await expect(page.locator(label === 'Time and sales' ? '.tape-panel' : '.news-panel').getByRole('button', { name: 'Return to latest' })).toBeVisible();
    const before = await region.innerText();
    const scroll = await region.evaluate(el => el.scrollTop);
    await page.waitForTimeout(label === 'News wire' ? 12500 : 1500);
    expect(await region.innerText()).toBe(before);
    expect(await region.evaluate(el => el.scrollTop)).toBe(scroll);
    await page.locator(label === 'Time and sales' ? '.tape-panel' : '.news-panel').getByRole('button', { name: 'Return to latest' }).click();
    expect(await region.evaluate(el => el.scrollTop)).toBe(0);
  }
});

test('recording layouts remain bounded with populated charts and reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [width, height] of [[1440, 900], [1920, 1080]]) {
    await page.setViewportSize({ width, height });
    await page.goto('/demo/?feed=paused#/terminal');
    await expect(page.locator('.terminal-grid > .panel')).toHaveCount(5);
    const metrics = await page.evaluate(() => ({
      documentOverflow: document.documentElement.scrollHeight - innerHeight,
      horizontalOverflow: document.documentElement.scrollWidth - innerWidth,
      panelOverflow: [...document.querySelectorAll('.terminal-grid > .panel')].some(el => el.getBoundingClientRect().bottom > innerHeight),
      chartHeight: document.querySelector('.replay-chart svg')!.getBoundingClientRect().height,
      pulse: getComputedStyle(document.querySelector('.live-dot')!).animationName,
    }));
    expect(metrics.documentOverflow).toBeLessThanOrEqual(0);
    expect(metrics.horizontalOverflow).toBeLessThanOrEqual(0);
    expect(metrics.panelOverflow).toBe(false);
    expect(metrics.chartHeight).toBeGreaterThan(180);
    expect(metrics.pulse).toBe('none');
    await page.goto('/demo/?feed=paused');
    await expect(page.getByTestId('market-value')).toBeInViewport();
    await expect(page.locator('.portfolio-value-chart')).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  }
});
