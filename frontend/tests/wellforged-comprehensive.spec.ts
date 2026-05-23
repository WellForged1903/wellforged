import { test, expect } from '@playwright/test';

test.describe('WellForged Comprehensive E2E Suite', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('Scenario 1: The Premium User Journey (UI & Transitions)', async ({ page }) => {
        // 1. Landing & Animation Check
        await expect(page.locator('h1')).toHaveText(/Proof.*is.*the.*New.*Standard/i, { timeout: 15000 });

        // 2. Transparency Flow
        const transparencyCTA = page.getByRole('button', { name: /Verify Your Batch/i }).first();
        await transparencyCTA.click();
        await expect(page).toHaveURL(/.*transparency/);

        const batchInput = page.getByPlaceholder(/Enter Batch Number/i);
        await expect(batchInput).toBeVisible();
        await batchInput.fill('WF20261234');
        await page.keyboard.press('Enter');

        await expect(page.locator('main')).toContainText(/Batch/i, { timeout: 10000 });

        // 3. Product Selection
        await page.goto('/product');
        const addToCartBtn = page.getByRole('button', { name: /Add to Cart/i }).first();
        await expect(addToCartBtn).toBeVisible();
        await addToCartBtn.click();

        // 4. Cart Drawer Transition
        await expect(page.getByText(/Your Cart/i)).toBeVisible();
        await expect(page.locator('aside, [role="dialog"]')).toContainText(/Moringa/i);
    });

    test('Scenario 2: Data Flow Integrity (Signup -> Order -> History)', async ({ page }) => {
        const uniqueEmail = `test_${Date.now()}@wellforged.in`;
        const uniquePhone = Math.floor(1000000000 + Math.random() * 9000000000).toString().slice(0, 10);

        // 1. Signup Flow
        await page.goto('/auth');
        await page.fill('input[id="firstName"]', 'John');
        await page.fill('input[id="lastName"]', 'Doe');
        await page.fill('input[id="email"]', uniqueEmail);
        await page.fill('input[id="whatsapp"]', uniquePhone);
        await page.click('button:has-text("Forge Account")');

        await page.waitForURL('**/', { timeout: 20000 });
        await expect(page.locator('nav')).toContainText(/John/i);

        // 2. Place actual order
        await page.goto('/product');
        await page.getByRole('button', { name: /Add to Cart/i }).first().click();
        await page.getByRole('button', { name: /Proceed to Checkout/i }).click();

        await expect(page).toHaveURL(/.*checkout/);

        const nameInput = page.getByPlaceholder(/Full Name/i);
        if (await nameInput.isVisible()) {
            await nameInput.fill('John Doe');
            await page.getByPlaceholder(/Flat \/ House No/i).fill('42 Integrity St');
            await page.getByPlaceholder(/City/i).fill('Bengaluru');
            await page.selectOption('select', { label: 'Karnataka' });
            await page.getByPlaceholder(/PIN Code/i).fill('560001');
            await page.getByRole('button', { name: /Save Shipping Details/i }).click();
        }

        const placeOrderBtn = page.getByRole('button', { name: /Pay|Place Order/i });
        await placeOrderBtn.click();

        await expect(page).toHaveURL(/.*order-success/, { timeout: 20000 });
        await expect(page.locator('main')).toContainText(/Confirmed|Success/i);

        // 3. Verify in Order History (DB Persistence)
        await page.goto('/profile');
        await expect(page.locator('text=Order History')).toBeVisible();
        await expect(page.locator('main')).toContainText(/#/);
    });

    test('Scenario 3: Extreme Conditions (Network & Errors)', async ({ page }) => {
        // 1. Mock a network failure
        await page.goto('/transparency');
        await page.route('**/api/batches/**', route => route.abort('failed'));
        await page.getByPlaceholder(/Enter Batch Number/i).fill('FAIL_TEST');
        await page.keyboard.press('Enter');
        await expect(page.locator('h1')).toBeVisible();

        // 2. Empty Cart Access
        await page.goto('/checkout');
        await page.waitForTimeout(1000); // Allow redirect
        await expect(page.url()).not.toContain('checkout');
    });

    test('Scenario 4: Ultra-Wide Viewport Integrity', async ({ page }) => {
        await page.setViewportSize({ width: 2560, height: 1440 });
        await page.goto('/');

        const container = page.locator('.max-w-7xl').first();
        const box = await container.boundingBox();
        if (box) {
            expect(box.width).toBeLessThan(1400);
            expect(box.x).toBeGreaterThan(500);
        }
    });

});
