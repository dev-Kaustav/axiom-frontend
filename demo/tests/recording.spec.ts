import { expect, test } from '@playwright/test';

// Short, full-size takes for evaluating demo pacing and composition.
test.use({ viewport: { width: 1920, height: 1080 }, video: { mode: 'on', size: { width: 1920, height: 1080 } } });
test.describe('recording previews', () => {
  for (const route of ['exposure', 'terminal']) {
    test(`${route} populated eighteen-second take`, async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto(`/demo/#/${route}`);
      const errors: string[] = [];
      page.on('pageerror', e => errors.push(String(e)));
      const catalyst = page.locator(route === 'terminal' ? '.wire-list li' : '.portfolio-catalyst');
      const started = Date.now();
      const before = await catalyst.first().innerText();
      await page.screenshot({ path: test.info().outputPath(`${route}-1920-start.png`) });
      await expect.poll(() => catalyst.first().innerText(), { timeout: 14000 }).not.toBe(before);
      await page.waitForTimeout(Math.max(0, 18000 - (Date.now() - started)));
      await page.screenshot({ path: test.info().outputPath(`${route}-1920-end.png`) });
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.waitForTimeout(600);
      await page.screenshot({ path: test.info().outputPath(`${route}-1440.png`) });
      expect(errors).toEqual([]);
    });
  }
});
