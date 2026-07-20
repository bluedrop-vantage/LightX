import type { Page } from '@playwright/test';

export async function dismissModePicker(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.localStorage.setItem('exotic-pantry:uiMode:v1', '"student"');
  });
  await page.reload();
}

export async function dragIngredient(
  page: Page,
  ingredientId: string,
  slotSelector: string,
): Promise<void> {
  const cardSelector = `.ingredient-card[data-ingredient="${ingredientId}"]`;
  await page.locator(cardSelector).waitFor({ state: 'visible' });
  await page.locator(slotSelector).waitFor({ state: 'visible' });
  await page.evaluate(
    ({ src, tgt, id }) => {
      const source = document.querySelector(src);
      const target = document.querySelector(tgt);
      if (!source || !target) throw new Error(`missing element: src=${src}, tgt=${tgt}`);
      const dt = new DataTransfer();
      dt.setData('application/x-ingredient', id);
      source.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer: dt }));
      target.dispatchEvent(new DragEvent('dragover', { bubbles: true, dataTransfer: dt }));
      target.dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer: dt }));
      source.dispatchEvent(new DragEvent('dragend', { bubbles: true, dataTransfer: dt }));
    },
    { src: cardSelector, tgt: slotSelector, id: ingredientId },
  );
}
