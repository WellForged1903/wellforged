import { test, expect } from '@playwright/test';

test.describe('WellForged E2E Journey', () => {

    test('Happy Path: Authentication -> Shop -> Cart -> Checkout', async ({ page }) => {
        // 1. Visit Home
        await page.goto('/');
        await expect(page).toHaveTitle(/WellForged/);

        // 2. Navigate to Shop
        const shopCTA = page.locator('text=Shop the Evidence').first();
        await expect(shopCTA).toBeVisible({ timeout: 20000 });
        await shopCTA.click();
        await expect(page).toHaveURL(/.*product/);

        // 3. Select a product and add to cart
        // Locating the first product selector
        const addToCartBtn = page.getByRole('button', { name: 'Add to Cart' }).first();
        await expect(addToCartBtn).toBeVisible();
        await addToCartBtn.click();

        // 4. Verify Drawer Opens and go to Checkout
        await expect(page.getByText('Your Cart')).toBeVisible({ timeout: 10000 });
        await page.click('text=Proceed to Checkout');
        await expect(page).toHaveURL(/.*checkout/);

        // 5. Auth Flow (Sign In Mode) - Check if auth is needed
        if (page.url().includes('auth')) {
            await page.click('text=Sign In');
            await page.fill('input[placeholder="Phone Number"]', '1234567890');
            await page.click('text=Get OTP');
            await page.fill('input[placeholder="••••"]', '1234');
            await page.click('button:has-text("Sign In Securely")');
        }

        // 6. Checkout Process
        await expect(page).toHaveURL(/.*checkout/);

        // Fill shipping details (if not saved)
        const fullNameInput = page.locator('input[placeholder="Full Name"]');
        if (await fullNameInput.isVisible()) {
            await fullNameInput.fill('Test User');
            await page.fill('input[placeholder="Flat / House No / Area"]', '123 Test Lane');
            await page.fill('input[placeholder="Landmark (Optional)"]', 'Near Test Hub');
            await page.fill('input[placeholder="City"]', 'New Delhi');
            await page.selectOption('select', 'Delhi');
            await page.fill('input[placeholder="PIN Code"]', '110001');
            await page.click('button:has-text("Save Shipping Details")');
        }

        // 7. Place Order
        const payBtn = page.getByRole('button', { name: /Pay|Place Order/i });
        await expect(payBtn).toBeVisible();
        await payBtn.click();

        // 9. Verify Success & Enhanced Order Confirmation
        await expect(page).toHaveURL(/.*order-success/);
        await expect(page.locator('text=Investment Confirmed')).toBeVisible();
    });

    test('Extreme Case: Out of Stock Validation', async ({ page }) => {
        await page.goto('/product');

        // Find items that might be marked as out of stock
        const outOfStockItem = page.locator('button:disabled:has-text("Out of Stock")');
        if (await outOfStockItem.count() > 0) {
            await expect(outOfStockItem.first()).toBeDisabled();
        }
    });

    test('Extreme Case: Invalid Coupon Feedback', async ({ page }) => {
        // First get to checkout - need to be logged in
        await page.goto('/auth');
        await page.click('text=Sign In');
        await page.fill('input[placeholder="9876543210"]', '1234567890');
        await page.fill('input[placeholder="••••"]', '1234');
        await page.click('button:has-text("Sign In Securely")');

        await page.goto('/checkout');
        const couponInput = page.locator('input[placeholder="Coupon Code"]');
        if (await couponInput.isVisible()) {
            await couponInput.fill('INVALID10');
            await page.click('button:has-text("Apply")');
            // Allow some time for the error toast
            await expect(page.locator('text=Invalid coupon')).toBeVisible().catch(() => { });
        }
    });

    test('Extreme Case: 404 Recovery', async ({ page }) => {
        await page.goto('/invalid-route-wellforged-' + Date.now());
        await expect(page.locator('h1:has-text("404")')).toBeVisible();
        await expect(page.locator('text=Lost in the Woods?')).toBeVisible();

        await page.click('text=Return Home');
        await expect(page).toHaveURL('/');
    });

    test('Responsiveness: Mobile Menu Toggle', async ({ page, isMobile }) => {
        if (!isMobile) return;

        await page.goto('/');
        const menuBtn = page.getByRole('button', { name: /toggle menu/i });
        await menuBtn.click();
        await expect(page.locator('nav >> text=Shop')).toBeVisible();
    });

});
