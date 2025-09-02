import { test, expect } from '@playwright/test';

test.describe('App Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main landing CTA', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Connect Spotify' })).toBeVisible();
  });

  test('should have proper page title', async ({ page }) => {
    await expect(page).toHaveTitle(/Spotify Musician Tool/);
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('link', { name: 'Connect Spotify' })).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.getByRole('link', { name: 'Connect Spotify' })).toBeVisible();
  });
});
