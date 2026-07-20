import { test, expect } from '@playwright/test';
import { dismissModePicker } from './helpers';

test.describe('Community tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.localStorage.clear());
    await dismissModePicker(page);
    await page.getByRole('button', { name: 'Community', exact: true }).click();
  });

  test('classroom pack loader accepts the example and updates missions', async ({ page }) => {
    await page.getByRole('button', { name: 'Insert example' }).click();
    await page.getByRole('button', { name: 'Load pack' }).click();
    await expect(page.locator('.classroom-loaded')).toContainText(/Interstellar Basics/);

    const dropdown = page.locator('.mission-select');
    await expect(dropdown).toContainText(/warp bubble.*Mars|Reach Mars/i);
  });

  test('rejects malformed pack JSON with an error', async ({ page }) => {
    await page.locator('.classroom-loader textarea').fill('{ not: json }');
    await page.getByRole('button', { name: 'Load pack' }).click();
    await expect(page.locator('.classroom-error')).toBeVisible();
  });
});
