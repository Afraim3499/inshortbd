import { test, expect } from '@playwright/test';

test.describe('CMS Authentication & Workflow', () => {

    test('admin: can login and access dashboard', async ({ page }) => {
        const email = process.env.TEST_ADMIN_EMAIL;
        const password = process.env.TEST_ADMIN_PASSWORD;

        if (!email || !password) {
            test.skip('Skipping login test: TEST_ADMIN_EMAIL or TEST_ADMIN_PASSWORD not set', () => { });
            return;
        }

        // 1. Go to Login
        await page.goto('/login'); // Or /admin depending on redirect

        // 2. Fill Credentials
        console.log('Filling credentials...');
        await page.fill('input[type="email"]', email);
        await page.fill('input[type="password"]', password);

        // 3. Click Login
        console.log('Clicking login...');
        await page.getByRole('button', { name: /Initialize Session/i }).click();

        // 4. Wait for redirection
        console.log('Waiting for redirect...');
        // Wait for ANY admin page to handle potential redirects
        await expect(page).toHaveURL(/\/admin\/(desk|dashboard)/, { timeout: 30000 });

        console.log('Logged in. Current URL:', page.url());

        // 5. Verify Content
        // Check for common admin elements
        await expect(page.locator('body')).toContainText(/The Desk|Dashboard/);

        // 6. Navigate to Editor
        console.log('Navigating to editor...');
        // Try multiple selectors for the button
        const newLink = page.getByRole('link', { name: /New Transmission|New Article/i }).first();
        if (await newLink.isVisible()) {
            await newLink.click();
        } else {
            console.log('Link not found, forcing navigation...');
            await page.goto('/admin/editor');
        }

        await expect(page).toHaveURL(/\/admin\/editor/, { timeout: 15000 });

        // 7. Check Editor Loads
        await expect(page.locator('input[id="title"]')).toBeVisible();
    });

});
