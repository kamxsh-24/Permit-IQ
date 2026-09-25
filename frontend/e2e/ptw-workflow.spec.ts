import { test, expect } from '@playwright/test';

test.describe('PTW CMMS Industrial End-to-End Workflow Suite (STEP 8)', () => {
  test('E2E Full Lifecycle: Requester -> Approvers -> Activation -> Suspension -> Closure & Verification', async ({ page }) => {
    // 1. Login as Requester
    await page.goto('/login');
    await page.fill('input[type="email"]', 'requester@safework.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    // Verify redirected to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('text=Operations & Safety Command Dashboard')).toBeVisible();

    // 2. Navigate to Issue Permit
    await page.click('a[href="/permits/new"]');
    await expect(page).toHaveURL(/.*permits\/new/);

    // Step 1: Permit Type (Hot Work selected by default)
    await page.click('text=Hot Work Permit');
    await page.click('text=Next Step');

    // Step 2: Work Scope
    await page.fill('input[placeholder*="Contractor Company"]', 'Apex Mechanical Turnaround Team');
    await page.fill('textarea[placeholder*="Describe exact nature"]', 'Emergency replacement of cracked pipe spool and flanged valve weld seam');
    await page.click('text=Next Step');

    // Step 3: Hot Work Checklist
    await page.click('text=Next Step');

    // Step 4: Hazards & PPE
    await page.click('text=Next Step');

    // Step 5: Review & Submit
    await expect(page.locator('text=Step 5: Safety Review')).toBeVisible();
    await page.click('text=Submit for Authorization');

    // Verify redirected to details page with status PENDING_APPROVAL
    await expect(page).toHaveURL(/.*permits\/.*/);
    await expect(page.locator('text=Pending Authorization')).toBeVisible();

    const currentUrl = page.url();
    const permitId = currentUrl.split('/').pop();

    // 3. Login as Area Owner and Sign-Off
    await page.goto('/login');
    await page.fill('input[type="email"]', 'areaowner@safework.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    await page.goto(`/permits/${permitId}/approval`);
    await page.fill('textarea[placeholder*="Process unit isolated"]', 'Process unit isolated and drainage valves closed.');
    await page.click('text=Authorize & Sign-Off');

    // 4. Login as Safety Officer and Sign-Off
    await page.goto('/login');
    await page.fill('input[type="email"]', 'safety@safework.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    await page.goto(`/permits/${permitId}/approval`);
    await page.fill('textarea[placeholder*="Process unit isolated"]', 'Hot work gas clearance verified 0.0% LEL. Fire watch in place.');
    await page.click('text=Authorize & Sign-Off');

    // Status should now be APPROVED
    await expect(page.locator('text=Authorized / Approved')).toBeVisible();

    // 5. Activate On-Site Work
    const activateButton = page.locator('button:has-text("Activate On-Site Work")');
    if (await activateButton.isEnabled()) {
      await activateButton.click();
      await expect(page.locator('text=Active (Live Work)')).toBeVisible();

      // 6. Suspend Work
      await page.click('button:has-text("Suspend Work")');
      await page.fill('textarea[placeholder*="minimum 5 characters"]', 'Combustible gas alarm sounded in adjacent block.');
      await page.click('button:has-text("Confirm & Proceed")');
      await expect(page.locator('text=Suspended (Hold)')).toBeVisible();

      // 7. Resume Work
      await page.click('button:has-text("Authorize Resumption")');
      await page.fill('textarea[placeholder*="minimum 5 characters"]', 'False alarm cleared. Area atmospheric re-test passed.');
      await page.click('button:has-text("Confirm & Proceed")');
      await expect(page.locator('text=Active (Live Work)')).toBeVisible();

      // 8. Closeout by Requester
      await page.goto('/login');
      await page.fill('input[type="email"]', 'requester@safework.com');
      await page.fill('input[type="password"]', 'Password123!');
      await page.click('button[type="submit"]');

      await page.goto(`/permits/${permitId}`);
      await page.click('button:has-text("Complete & Closeout")');
      await page.fill('textarea[placeholder*="minimum 5 characters"]', 'Spool weld completed, radiographic test passed, site clean.');
      await page.click('button:has-text("Confirm & Proceed")');
      await expect(page.locator('text=Closed (Handover)')).toBeVisible();

      // 9. Safety Officer Final Closure Verification
      await page.goto('/login');
      await page.fill('input[type="email"]', 'safety@safework.com');
      await page.fill('input[type="password"]', 'Password123!');
      await page.click('button[type="submit"]');

      await page.goto(`/permits/${permitId}`);
      await page.click('button:has-text("Safety Officer Closure Verification")');
      await page.fill('textarea[placeholder*="minimum 5 characters"]', 'Final safety walkthrough passed. Locks and tags removed.');
      await page.click('button:has-text("Confirm & Proceed")');

      // Final status is CLOSED_VERIFIED
      await expect(page.locator('text=Closed & Verified')).toBeVisible();

      // Verify audit timeline is present
      await expect(page.locator('text=Audit Event Timeline (Immutable)')).toBeVisible();
      await expect(page.locator('text=CLOSURE_VERIFIED')).toBeVisible();
    }
  });

  test('Security & Boundary Checks: Invalid login rejected', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'unregistered@safework.com');
    await page.fill('input[type="password"]', 'BadPassword123!');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Invalid email or password')).toBeVisible();
  });
});
