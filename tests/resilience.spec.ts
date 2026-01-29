import { test, expect } from '@playwright/test';

test('ui resilience: no visual errors on homepage', async ({ page }) => {
    await page.goto('/');

    // Check console for errors
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log(`Page Error: ${msg.text()}`);
        }
    });

    // Ensure footer loads (end of page reached without crash)
    await expect(page.locator('footer')).toBeVisible();
});
