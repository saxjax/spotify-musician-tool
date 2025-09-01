import { test, expect } from '@playwright/test';

test('landing CTA', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Connect Spotify' })).toBeVisible();
});
