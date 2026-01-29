import { test, expect } from '@playwright/test';

test('smoke test: homepage loads', async ({ page }) => {
    await page.goto('/');
    // Check for the main title
    await expect(page).toHaveTitle(/Inshort/);
    // Check for navigation existence (guaranteed by Layout)
    await expect(page.locator('nav').first()).toBeVisible();
});
