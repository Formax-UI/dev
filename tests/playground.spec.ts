import { expect, test } from '@playwright/test';

test('playground renders the component demos', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Formax UI Component Playground/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Basic Components/i })).toBeVisible();
});
