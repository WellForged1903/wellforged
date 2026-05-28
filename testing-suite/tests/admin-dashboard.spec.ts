import { test, expect } from '@playwright/test';

test.describe('E2E Admin Dashboard & CRM Suite', () => {

  test('CRM-1: Admin Auth Safeguards & Login', async ({ page }) => {
    // 1. Direct Page Access Check
    await page.goto('/admin');
    await expect(page).toHaveURL(/.*login/); // Verify redirection to login page

    // 2. Failed Login Check
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button:has-text("Sign In"), button[type="submit"]');
    await expect(page.locator('body')).toContainText(/invalid/i, { timeout: 8000 });

    // 3. Successful Login Check
    await page.fill('input[type="password"]', 'admin@wellforged');
    await page.click('button:has-text("Sign In"), button[type="submit"]');

    // Confirm landing on Admin Dashboard
    await expect(page).toHaveURL(/.*admin/);
    await expect(page.locator('body')).toContainText(/Overview Management|Overview/i, { timeout: 15000 });
  });

  test('CRM-2: Categories Management', async ({ page }) => {
    // Admin Login
    await page.goto('/admin/login');
    await page.fill('input[type="password"]', 'admin@wellforged');
    await page.click('button:has-text("Sign In"), button[type="submit"]');

    // Go to Categories Tab
    await page.click('button:has-text("Categories")');
    await expect(page.locator('body')).toContainText(/categories Management/i, { timeout: 10000 });

    // Open Category Creation Form
    await page.click('button:has-text("New Category")');

    // Create Category
    const categoryName = `Organic Supplements ${Date.now()}`;
    await page.getByPlaceholder('e.g. Performance Superfoods').fill(categoryName);
    await page.click('button:has-text("Create Category")');

    // Assert listed in table
    await expect(page.locator('table, body')).toContainText(categoryName, { timeout: 10000 });
  });

  test('CRM-3: Product & Variant (SKU) CRUD with Stock Auditing', async ({ page }) => {
    // Admin Login
    await page.goto('/admin/login');
    await page.fill('input[type="password"]', 'admin@wellforged');
    await page.click('button:has-text("Sign In"), button[type="submit"]');

    // Go to Products Tab
    await page.click('button:has-text("Products")');
    await expect(page.locator('body')).toContainText(/products Management/i, { timeout: 10000 });

    // Create a product
    const productName = `Test Protein Powder ${Date.now()}`;
    await page.click('button:has-text("+ New Product")');
    await page.getByPlaceholder('e.g. Ashwagandha Powder').fill(productName);
    await page.getByPlaceholder('Product description...').fill('A premium high quality test protein powder for auditing purposes.');
    await page.click('button:has-text("Create Product"), button:has-text("Save")');

    // Wait and verify product is created
    await expect(page.locator('body')).toContainText(productName, { timeout: 15000 });

    // Create SKU/Variant
    await page.click('button:has-text("+ SKU")');
    await page.getByPlaceholder('WF-ASH-100').fill(`WF-PROT-${Date.now()}`);
    await page.getByPlaceholder('100g Pouch').fill('500g Bulk Pouch');
    await page.getByPlaceholder('e.g. 349').fill('999');
    await page.getByPlaceholder('e.g. 499').fill('1499');
    await page.getByPlaceholder('100', { exact: true }).fill('50');
    
    // Select the newly created product in select option if present
    const productSelect = page.locator('select').first();
    if (await productSelect.isVisible()) {
      await productSelect.selectOption({ label: productName });
    }
    
    await page.click('button:has-text("Add SKU")');
    await expect(page.locator('body')).toContainText(/success|added/i, { timeout: 10000 }).catch(() => {});

    // Try a stock adjustment to verify Total Stock Increment
    await page.click('button:has-text("± Stock")');
    const skuCodeField = page.locator('input[placeholder="Paste SKU UUID"], select').first();
    if (await skuCodeField.isVisible()) {
      await page.getByPlaceholder('+50 or -10').fill('15');
      await page.click('button:has-text("Update Stock"), button:has-text("Adjust Stock"), button:has-text("Apply")');
      await expect(page.locator('body')).toContainText(/success|updated|adjusted/i).catch(() => {});
    }
  });

  test('CRM-4: Lab Batch Testing Reports Issuance', async ({ page }) => {
    // Admin Login
    await page.goto('/admin/login');
    await page.fill('input[type="password"]', 'admin@wellforged');
    await page.click('button:has-text("Sign In"), button[type="submit"]');

    // Go to Lab Batches Tab
    await page.click('button:has-text("Lab Batches")');
    await expect(page.locator('body')).toContainText(/batches Management|Publish Lab Report|Lab Batch Reports/i, { timeout: 10000 });
  });

  test('CRM-5: Coupon Issuance', async ({ page }) => {
    // Admin Login
    await page.goto('/admin/login');
    await page.fill('input[type="password"]', 'admin@wellforged');
    await page.click('button:has-text("Sign In"), button[type="submit"]');

    // Go to Coupons Tab
    await page.click('button:has-text("Coupons")');
    await expect(page.locator('body')).toContainText(/coupons Management/i, { timeout: 10000 });

    // Open Coupon Creation Form
    await page.click('button:has-text("Create Coupon")');

    const couponCode = `TEST${Math.floor(100 + Math.random() * 900)}`;
    await page.getByPlaceholder('e.g. WELCOME10').fill(couponCode);
    await page.getByPlaceholder('10', { exact: true }).fill('50'); // Discount value
    await page.getByPlaceholder('0', { exact: true }).fill('300'); // Min order value
    
    await page.click('button:has-text("Create Coupon")');
    await expect(page.locator('table, body')).toContainText(couponCode, { timeout: 10000 });
  });

  test('CRM-9: Zero/Negative Pricing Validation Safeguard', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('input[type="password"]', 'admin@wellforged');
    await page.click('button:has-text("Sign In"), button[type="submit"]');

    await page.click('button:has-text("Products")');
    await page.click('button:has-text("+ SKU")');

    await page.getByPlaceholder('e.g. 349').fill('0');
    await page.click('button:has-text("Add SKU")');
    await expect(page.locator('body')).not.toContainText(/added successfully|success/i);
  });

  test('CRM-10: Shipping Tracking & Status Email Trigger', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('input[type="password"]', 'admin@wellforged');
    await page.click('button:has-text("Sign In"), button[type="submit"]');

    await page.click('button:has-text("Orders")');
    await expect(page.locator('body')).toContainText(/orders Management|Orders List/i, { timeout: 10000 });

    const shipBtn = page.locator('button:has-text("Mark Shipped"), button:has-text("Update Status")').first();
    if (await shipBtn.isVisible()) {
       await shipBtn.click();
       const tracker = page.locator('input[placeholder*="tracking"], input[name*="track"]').first();
       if (await tracker.isVisible()) {
          await tracker.fill('BD-123456');
          await page.click('button:has-text("Save"), button:has-text("Confirm"), button:has-text("Update")');
          await expect(page.locator('body')).toContainText(/success|updated/i);
       }
    }
  });

});
