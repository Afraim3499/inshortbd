import { test, expect } from '@playwright/test';

test('navigation: verify critical menu items', async ({ page }) => {
    // Go to homepage
    await page.goto('/');

    // Wait explicitly for the nav to attach
    // Often "nav" tag is standard, but sometimes it's wrapped
    const nav = page.locator('nav, [role="navigation"]').first();
    await expect(nav).toBeVisible({ timeout: 15000 });

    // Verify at least one link exists in it
    await expect(nav.locator('a').first()).toBeVisible();
});
