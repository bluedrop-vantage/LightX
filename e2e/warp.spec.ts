import { test, expect } from '@playwright/test';
import { dismissModePicker, dragIngredient } from './helpers';

test.describe('Warp Bubble constructor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.localStorage.clear());
    await dismissModePicker(page);
    await page.getByRole('button', { name: 'Warp Bubble', exact: true }).click();
  });

  test('empty bubble wall yields an incoherent verdict', async ({ page }) => {
    const verdict = page.locator('.verdict-card');
    await expect(verdict).toContainText(/Empty bubble wall|Empty rig/);
    await expect(verdict).toHaveClass(/verdict-red/);
  });

  test('positive matter in the wall builds a planet, not a drive', async ({ page }) => {
    await dragIngredient(page, 'ordinary', '.warp-constructor .slot');
    const verdict = page.locator('.verdict-card');
    await expect(verdict).toContainText(/planet/i);
    await expect(verdict).toHaveClass(/verdict-red/);
  });

  test('negative energy + breaking QI seal produces worksWithSeals', async ({ page }) => {
    await dragIngredient(page, 'negativeEnergy', '.warp-constructor .slot');
    await page.locator('button.seal-badge', { hasText: 'Suspend Quantum Inequalities' }).click();
    const verdict = page.locator('.verdict-card');
    await expect(verdict).toHaveClass(/verdict-yellow/);
    await expect(verdict).toContainText(/Bubble surfs|seal|works/i);
  });

  test('dark energy is rejected by the bubble-wall slot (unshapeable)', async ({ page }) => {
    await dragIngredient(page, 'darkEnergy', '.warp-constructor .slot');
    await expect(page.locator('.slot-reject')).toContainText(/cannot go here|unshapeable|wrong role/i);
  });
});
