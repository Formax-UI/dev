import { expect, test } from '@playwright/test';

test('docs homepage links to Formax Studio', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Formax UI', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: /Studio/i })).toBeVisible();
});

test('studio generates, edits, previews, and exports a workflow', async ({ page }) => {
  await page.goto('/studio');

  await expect(page.getByRole('heading', { name: /AI-ready form workflow builder/i })).toBeVisible();
  await expect(page.getByText('Live preview')).toBeVisible();
  await expect(page.getByText('Exports')).toBeVisible();

  await page.getByLabel('Prompt').fill('Create an enterprise checkout form with billing fields');
  await page.getByRole('button', { name: /Generate/i }).click();

  await expect(page.getByRole('button', { name: /Checkout/i })).toBeVisible();
  await expect(page.getByLabel('Label')).toBeVisible();

  await page.getByTestId('studio-field-email').click();
  await page.getByLabel('Label').fill('Work email');

  await expect(page.getByLabel('Work email')).toBeVisible();

  await page.getByRole('button', { name: 'Zod' }).click();
  await expect(page.locator('pre')).toContainText('z.object');

  await page.getByRole('button', { name: 'JSON', exact: true }).click();
  await expect(page.locator('pre')).toContainText('"schema": "zod"');
});
