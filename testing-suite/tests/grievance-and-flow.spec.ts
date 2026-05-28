import { test, expect } from '@playwright/test';

test.describe('Interactive State & Multi-Flow Tests', () => {

  test('CRM-7: Customer Review Moderation Loop (Approval & Rejection)', async ({ page }) => {
    // 1. Submit two reviews on the public storefront
    await page.goto('/product');

    // Verify product detail page loaded
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });

    // Wait for reviews section to finish loading and review button to attach
    const writeReviewBtn = page.getByRole('button', { name: /Write a Review/i });
    await expect(writeReviewBtn).toBeVisible({ timeout: 15000 });
    await writeReviewBtn.click();

    // Submit Review A (Rohan, 5-Star)
    await page.getByPlaceholder('John Doe').fill('Rohan E2E');
    await page.getByPlaceholder('john@example.com').fill('rohan@wellforged.in');
    await page.getByPlaceholder('How did this product help you?').fill('Rohan approved review check - Exceptional purity!');
    
    const reviewPromiseA = page.waitForResponse(response =>
      response.url().includes('/api/reviews') && response.request().method() === 'POST' && response.status() === 201
    );
    await page.click('button:has-text("Publish Review")');
    await reviewPromiseA;
    await expect(page.locator('body')).toContainText(/Thank you/i, { timeout: 15000 });

    // Re-open form to submit Review B (Vikram, 1-Star)
    await page.reload();
    // Wait for reviews section to finish loading and review button to attach
    await expect(page.getByRole('button', { name: /Write a Review/i })).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /Write a Review/i }).click();
    
    // Choose 1 star rating by clicking the first star button
    const stars = page.locator('button >> .h-10.w-10');
    if (await stars.count() > 0) {
      await stars.first().click();
    }

    await page.getByPlaceholder('John Doe').fill('Vikram E2E');
    await page.getByPlaceholder('john@example.com').fill('vikram@wellforged.in');
    await page.getByPlaceholder('How did this product help you?').fill('Vikram rejected review check - Damaged delivery box.');
    
    const reviewPromiseB = page.waitForResponse(response =>
      response.url().includes('/api/reviews') && response.request().method() === 'POST' && response.status() === 201
    );
    await page.click('button:has-text("Publish Review")');
    await reviewPromiseB;
    await expect(page.locator('body')).toContainText(/Thank you/i, { timeout: 15000 });

    // 2. Log in as Admin to moderate
    await page.goto('/admin/login');
    await page.fill('input[type="password"]', 'admin@wellforged');
    await page.click('button[type="submit"]');

    // Go to Marketing & Reviews Tab
    await page.click('button:has-text("Marketing & Reviews"), button:has-text("Marketing")');
    await expect(page.locator('body')).toContainText(/Marketing & Reviews|Review Moderation/i, { timeout: 10000 });

    // 3. Approve Rohan's review
    const rohanCard = page.locator('.rounded-2xl', { hasText: 'Rohan E2E' }).first();
    const approveBtn = rohanCard.getByRole('button', { name: /Approve/i });
    await expect(approveBtn).toBeVisible({ timeout: 15000 });
    await approveBtn.click();
    await expect(page.locator('body')).toContainText(/approved|success/i, { timeout: 5000 }).catch(() => {});

    // 4. Reject Vikram's review
    const vikramCard = page.locator('.rounded-2xl', { hasText: 'Vikram E2E' }).first();
    const rejectBtn = vikramCard.getByRole('button', { name: /Reject/i });
    await expect(rejectBtn).toBeVisible({ timeout: 15000 });
    await rejectBtn.click();
    await expect(page.locator('body')).toContainText(/rejected|success/i, { timeout: 5000 }).catch(() => {});

    // 5. Navigate back to public product details; verify Rohan shows, Vikram does not
    await page.goto('/product');

    await expect(page.locator('body')).toContainText('Rohan approved review check');
    await expect(page.locator('body')).not.toContainText('Vikram rejected review check');
  });

  test('CRM-8: Grievance Resolution Lifecycle', async ({ page }) => {
    // 1. Lodge grievance publicly
    await page.goto('/support/grievance-redressal');
    const ticketEmail = `grievance_${Date.now()}@test.com`;
    
    await page.getByPlaceholder('Enter your name').fill('Grievance Auditor');
    await page.locator('input[type="email"]').first().fill(ticketEmail);
    await page.getByPlaceholder('+91 XXXXX XXXXX').fill('9876543210');
    await page.getByPlaceholder('e.g. WF-170284').fill('WF-RACE-001');
    await page.getByPlaceholder(/Provide complete details/i).fill('Package arrived with damaged batch certificate.');

    // Intercept ticket response to save ticket ID
    const ticketPromise = page.waitForResponse(response => 
      response.url().includes('/api/grievances') && response.request().method() === 'POST'
    );
    await page.click('button:has-text("File Official Ticket")');
    const response = await ticketPromise;
    const resBody = await response.json();
    const ticketId = resBody.ticket?.ticket_id || resBody.ticket_id || resBody.id;
    console.log(`Audited Ticket ID generated: ${ticketId}`);

    // 2. Log in as admin and resolve it
    await page.goto('/admin/login');
    await page.fill('input[type="password"]', 'admin@wellforged');
    await page.click('button[type="submit"]');

    // Go to Grievance Center Tab
    await page.click('button:has-text("Grievance Center"), button:has-text("Grievances")');
    await expect(page.locator('body')).toContainText(/Grievance Center/i, { timeout: 10000 });

    // Select ticket
    const ticketRow = page.locator(`text=${ticketId}`).first();
    await expect(ticketRow).toBeVisible({ timeout: 15000 });
    await ticketRow.click();
    
    // Resolve it
    await page.locator('textarea[placeholder*="official action"]').fill('Audited and issued replacement lab report via support channel.');
    await page.click('button:has-text("Mark Grievance as Resolved")');
    await expect(page.locator('body')).toContainText(/resolved|success/i, { timeout: 8000 }).catch(() => {});

    // 3. Verify resolution publicly
    await page.goto('/support/grievance-redressal');
    await page.click('button:has-text("Track Status")');
    await page.getByPlaceholder('e.g. WF-TKT-382904').fill(ticketId);
    await page.locator('input[type="email"]').last().fill(ticketEmail);
    await page.click('button:has-text("Track Grievance")');

    // Assert status displays Resolved and contains auditor details
    await expect(page.locator('body')).toContainText(/Resolved/i, { timeout: 10000 });
    await expect(page.locator('body')).toContainText(/audited and issued replacement/i, { timeout: 10000 });
  });

});
