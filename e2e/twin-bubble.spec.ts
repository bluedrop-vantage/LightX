import { test, expect } from '@playwright/test';
import { dismissModePicker, dragIngredient } from './helpers';

test.describe('Twin-bubble CTC alarm (spec §6.3)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.localStorage.clear());
    await dismissModePicker(page);
    await page.getByRole('button', { name: 'Warp Bubble', exact: true }).click();
  });

  test('two superluminal bubbles crossing triggers the CTC overlay + logs a seal', async ({ page }) => {
    await dragIngredient(page, 'negativeEnergy', '.warp-constructor .slot');
    await page.locator('button.seal-badge', { hasText: 'Suspend Quantum Inequalities' }).click();
    await page
      .getByRole('slider', { name: /Bubble velocity/ })
      .fill('4');
    await page.getByRole('checkbox', { name: /Twin bubble/ }).check();
    await expect(page.locator('.overlay-chronology')).toBeVisible({ timeout: 15_000 });
    const log = await page.evaluate(() =>
      JSON.parse(window.localStorage.getItem('exotic-pantry:sealLog:v1') ?? '[]'),
    );
    expect(log.some((s: { seal: string }) => s.seal === 'chronologyProtection')).toBe(true);
  });
});
