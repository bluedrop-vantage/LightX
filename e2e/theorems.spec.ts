import { test, expect } from '@playwright/test';
import { dismissModePicker, dragIngredient } from './helpers';

test.describe('Theorem explainer + citations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.localStorage.clear());
    await dismissModePicker(page);
    await page.getByRole('button', { name: 'Warp Bubble', exact: true }).click();
  });

  test('clicking a Verdict-card citation opens the theorem explainer', async ({ page }) => {
    await dragIngredient(page, 'negativeEnergy', '.warp-constructor .slot');
    await page.locator('button.seal-badge', { hasText: 'Suspend Quantum Inequalities' }).click();
    const citeButton = page.locator('.verdict-seals button.cite').first();
    await expect(citeButton).toBeVisible();
    await citeButton.click();
    const dialog = page.getByRole('dialog', { name: /Theorem explainer/i });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(/Alcubierre|Ford|Hawking|Maldacena/);
    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect(dialog).toBeHidden();
  });
});
