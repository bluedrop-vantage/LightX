import { test, expect } from '@playwright/test';
import { dismissModePicker, dragIngredient } from './helpers';

test.describe('Wormhole constructor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.localStorage.clear());
    await dismissModePicker(page);
    await page.getByRole('button', { name: 'Wormhole', exact: true }).click();
  });

  test('positive matter in throat produces a pinch-off verdict', async ({ page }) => {
    await dragIngredient(page, 'ordinary', '.wormhole-constructor .slot');
    const verdict = page.locator('.verdict-card');
    await expect(verdict).toContainText(/pinch/i);
    await expect(verdict).toHaveClass(/verdict-red/);
  });

  test('Maldacena mode with dark-sector fermions holds throat sub-light', async ({ page }) => {
    await dragIngredient(page, 'darkSectorFermion', '.wormhole-constructor .slot');
    await page.getByRole('checkbox', { name: /Maldacena mode/ }).check();
    const verdict = page.locator('.verdict-card');
    await expect(verdict).toContainText(/sub-light/i);
    await expect(verdict).toHaveClass(/verdict-yellow/);
    await expect(page.locator('.overlay-chronology')).toBeHidden();
  });

  test('switching to 3D embedding view mounts the perspective canvas', async ({ page }) => {
    await page.getByRole('button', { name: '3D embedding' }).click();
    await expect(page.locator('.embedding-view canvas')).toBeVisible();
  });
});
