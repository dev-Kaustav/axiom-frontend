import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

const universe = JSON.parse(readFileSync(new URL('../src/data/universe/universe.json', import.meta.url), 'utf8')) as {
  contracts: { contract_id: string; event_id: string; slug: string }[];
  events: { event_id: string; slug: string }[];
};

test('relationship settlement evidence opens the selected Polymarket contract', async ({ page, context }) => {
  // Keep this check independent of venue uptime while exercising a real click
  // and new-tab navigation, including the contract selected in the bug report.
  await context.route('https://polymarket.com/**', route => route.fulfill({
    contentType: 'text/html', body: '<title>Venue contract</title>',
  }));
  await page.goto('/demo/#/relationships');
  const contract = universe.contracts.find(c => c.contract_id === '2589811')!;
  const event = universe.events.find(e => e.event_id === contract.event_id)!;
  const expectedUrl = `https://polymarket.com/event/${event.slug}/${contract.slug}`;
  await page.locator('.contract-node').filter({ hasText: '#2589811' }).click();
  const venueLink = page.getByRole('link', { name: 'Venue rule & identifiers' });
  await expect(venueLink).toHaveAttribute('href', expectedUrl);
  await expect(venueLink).toHaveAttribute('target', '_blank');
  const popupPromise = page.waitForEvent('popup');
  await venueLink.click();
  const popup = await popupPromise;
  await expect(popup).toHaveURL(expectedUrl);
  await popup.close();

  // The same evidence renderer serves comparisons and multi-leg baskets.
  await page.locator('.contract-node').filter({ hasText: '#2589812' }).click({ modifiers: ['Shift'] });
  await expect(page.getByRole('link', { name: 'Venue rule & identifiers' })).toHaveCount(2);
  await page.locator('.exact-group-strip button').first().click();
  const links = page.getByRole('link', { name: 'Venue rule & identifiers' });
  await expect(links).toHaveCount(5);
  for (const link of await links.all()) {
    await expect(link).toHaveAttribute('href', /^https:\/\/polymarket\.com\/event\/[^/]+\/[^/]+$/);
  }
});
