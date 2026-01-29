import { test, expect } from '@playwright/test';

test('news feed: page shell loads', async ({ page }) => {
    await page.goto('/');
    // Basic shell check
    await expect(page.locator('nav, header').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('main')).toBeVisible({ timeout: 15000 });
});
