import { test, expect } from '@playwright/test';

test('finance: page shell loads', async ({ page }) => {
    await page.goto('/finance/markets');

    // Try to find the header which should be common
    // FinanceHeader likely has a nav or header
    const header = page.locator('header, nav').first();
    await expect(header).toBeVisible({ timeout: 15000 });

    // Check that the main application shell isn't a 500 error
    await expect(page.locator('body')).not.toContainText('Application error');
});
