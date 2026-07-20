import { test, expect } from '@playwright/test';

test.describe('Mode picker (first launch)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();
  });

  test('shows on first launch and persists chosen mode', async ({ page }) => {
    const dialog = page.getByRole('dialog', { name: /choose a depth mode/i });
    await expect(dialog).toBeVisible();

    await page.getByRole('button', { name: /^Student/ }).click();
    await expect(dialog).toBeHidden();

    const persisted = await page.evaluate(() =>
      window.localStorage.getItem('exotic-pantry:uiMode:v1'),
    );
    expect(persisted).toBe('"student"');

    await page.reload();
    await expect(page.getByRole('dialog', { name: /choose a depth mode/i })).toBeHidden();
  });

  test('skip button defaults to Student', async ({ page }) => {
    await page.getByRole('button', { name: /Skip \(default to Student\)/ }).click();
    const persisted = await page.evaluate(() =>
      window.localStorage.getItem('exotic-pantry:uiMode:v1'),
    );
    expect(persisted).toBe('"student"');
  });
});
