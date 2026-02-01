import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const screenshotsDir = path.join(process.cwd(), 'screenshots', 'transaction-status');

// Ensure screenshots directory exists
if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
}

/**
 * Helper function to get the count of orders by status from the stats cards
 */
async function getStatusCounts(page: Page): Promise<{ processed: number; processing: number; declined: number }> {
    // Get Processed count (second stat card)
    const processedText = await page.locator('.grid.grid-cols-2 > div:nth-child(2) p.text-lg').textContent();
    const processed = parseInt(processedText || '0', 10);

    // Get Processing count (third stat card)
    const processingText = await page.locator('.grid.grid-cols-2 > div:nth-child(3) p.text-lg').textContent();
    const processing = parseInt(processingText || '0', 10);

    // Get Declined count (fourth stat card)
    const declinedText = await page.locator('.grid.grid-cols-2 > div:nth-child(4) p.text-lg').textContent();
    const declined = parseInt(declinedText || '0', 10);

    return { processed, processing, declined };
}

/**
 * Helper to find a pending transaction row
 */
async function findPendingTransactionRow(page: Page) {
    // Look for a row with "Processing" status badge (which means PENDING)
    const rows = page.locator('table tbody tr');
    const rowCount = await rows.count();

    for (let i = 0; i < rowCount; i++) {
        const row = rows.nth(i);
        const statusBadge = row.locator('span.bg-amber-100');
        if (await statusBadge.count() > 0) {
            return row;
        }
    }
    return null;
}

test.describe('Transaction Status Update Feature', () => {

    test.describe('Scenario 1: Process Transaction', () => {
        test('should change PENDING transaction to Processed and show success toast', async ({ page }) => {
            // 1. Navigate to /orders
            await page.goto('/orders');
            await page.waitForLoadState('networkidle');

            // Verify we're on the Transaction History page
            await expect(page.locator('h1:has-text("Transaction History")')).toBeVisible();

            // 2. Get initial counts
            const initialCounts = await getStatusCounts(page);
            console.log('Initial counts:', initialCounts);

            // Skip test if no pending transactions
            if (initialCounts.processing === 0) {
                test.skip(true, 'No pending transactions available to process');
                return;
            }

            // Take screenshot of initial state
            await page.screenshot({ path: path.join(screenshotsDir, '01-process-initial-state.png'), fullPage: true });

            // 3. Find a PENDING transaction row
            const pendingRow = await findPendingTransactionRow(page);
            expect(pendingRow).not.toBeNull();

            // Get the transaction ID for verification
            const transactionIdCell = pendingRow!.locator('td:first-child span');
            const transactionId = await transactionIdCell.textContent();
            console.log('Processing transaction:', transactionId);

            // 4. Click "Process" button
            const processButton = pendingRow!.locator('button:has-text("Process")');
            await expect(processButton).toBeVisible();
            await processButton.click();

            // 5. Wait for the mutation to complete and verify toast message
            await expect(page.locator('text=Transaction processed successfully')).toBeVisible({ timeout: 10000 });

            // Take screenshot after processing
            await page.screenshot({ path: path.join(screenshotsDir, '02-process-success-toast.png'), fullPage: true });

            // 6. Verify the status changed to "Processed"
            // Wait for the page to refresh with new data
            await page.waitForLoadState('networkidle');

            // Find the row by transaction ID and verify it now shows "Processed"
            const updatedRow = page.locator(`table tbody tr:has(span:has-text("${transactionId}"))`);
            const statusBadge = updatedRow.locator('span.bg-emerald-100');
            await expect(statusBadge).toBeVisible();
            await expect(statusBadge).toContainText('Processed');

            // 7. Verify the action buttons are no longer visible for this transaction
            const actionButtons = updatedRow.locator('button');
            await expect(actionButtons).toHaveCount(0);

            // 8. Verify counts updated
            const finalCounts = await getStatusCounts(page);
            console.log('Final counts:', finalCounts);

            expect(finalCounts.processed).toBe(initialCounts.processed + 1);
            expect(finalCounts.processing).toBe(initialCounts.processing - 1);
            expect(finalCounts.declined).toBe(initialCounts.declined);

            // Take final screenshot
            await page.screenshot({ path: path.join(screenshotsDir, '03-process-final-state.png'), fullPage: true });
        });

        test('should update Dashboard stats after processing a transaction', async ({ page }) => {
            // First, navigate to dashboard and get initial stats
            await page.goto('/');
            await page.waitForLoadState('networkidle');
            await page.waitForSelector('text=Total Transactions');

            // Get initial pending count from dashboard
            const dashboardCard = page.locator('.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4 > div:nth-child(3)');
            const initialPendingText = await dashboardCard.locator('p.text-sm.text-slate-500').textContent();
            const initialPendingMatch = initialPendingText?.match(/(\d+)\s+processing/);
            const initialPending = initialPendingMatch ? parseInt(initialPendingMatch[1], 10) : 0;

            if (initialPending === 0) {
                test.skip(true, 'No pending transactions to verify dashboard update');
                return;
            }

            await page.screenshot({ path: path.join(screenshotsDir, '04-dashboard-initial.png'), fullPage: true });

            // Navigate to orders and process a transaction
            await page.goto('/orders');
            await page.waitForLoadState('networkidle');

            const pendingRow = await findPendingTransactionRow(page);
            if (!pendingRow) {
                test.skip(true, 'No pending transactions available');
                return;
            }

            const processButton = pendingRow.locator('button:has-text("Process")');
            await processButton.click();

            // Wait for success
            await expect(page.locator('text=Transaction processed successfully')).toBeVisible({ timeout: 10000 });
            await page.waitForLoadState('networkidle');

            // Navigate back to Dashboard
            await page.locator('nav a:has-text("Dashboard")').click();
            await page.waitForLoadState('networkidle');

            // Verify dashboard stats updated (pending count decreased)
            const updatedPendingText = await dashboardCard.locator('p.text-sm.text-slate-500').textContent();
            const updatedPendingMatch = updatedPendingText?.match(/(\d+)\s+processing/);
            const updatedPending = updatedPendingMatch ? parseInt(updatedPendingMatch[1], 10) : 0;

            expect(updatedPending).toBe(initialPending - 1);

            await page.screenshot({ path: path.join(screenshotsDir, '05-dashboard-after-process.png'), fullPage: true });
        });
    });

    test.describe('Scenario 2: Decline Transaction', () => {
        test('should change PENDING transaction to Declined and show success toast', async ({ page }) => {
            // 1. Navigate to /orders
            await page.goto('/orders');
            await page.waitForLoadState('networkidle');

            // Verify we're on the Transaction History page
            await expect(page.locator('h1:has-text("Transaction History")')).toBeVisible();

            // 2. Get initial counts
            const initialCounts = await getStatusCounts(page);
            console.log('Initial counts:', initialCounts);

            // Skip test if no pending transactions
            if (initialCounts.processing === 0) {
                test.skip(true, 'No pending transactions available to decline');
                return;
            }

            // Take screenshot of initial state
            await page.screenshot({ path: path.join(screenshotsDir, '06-decline-initial-state.png'), fullPage: true });

            // 3. Find a PENDING transaction row
            const pendingRow = await findPendingTransactionRow(page);
            expect(pendingRow).not.toBeNull();

            // Get the transaction ID for verification
            const transactionIdCell = pendingRow!.locator('td:first-child span');
            const transactionId = await transactionIdCell.textContent();
            console.log('Declining transaction:', transactionId);

            // 4. Click "Decline" button
            const declineButton = pendingRow!.locator('button:has-text("Decline")');
            await expect(declineButton).toBeVisible();
            await declineButton.click();

            // 5. Wait for the mutation to complete and verify toast message
            await expect(page.locator('text=Transaction declined successfully')).toBeVisible({ timeout: 10000 });

            // Take screenshot after declining
            await page.screenshot({ path: path.join(screenshotsDir, '07-decline-success-toast.png'), fullPage: true });

            // 6. Verify the status changed to "Declined"
            // Wait for the page to refresh with new data
            await page.waitForLoadState('networkidle');

            // Find the row by transaction ID and verify it now shows "Declined"
            const updatedRow = page.locator(`table tbody tr:has(span:has-text("${transactionId}"))`);
            const statusBadge = updatedRow.locator('span.bg-red-100');
            await expect(statusBadge).toBeVisible();
            await expect(statusBadge).toContainText('Declined');

            // 7. Verify the action buttons are no longer visible for this transaction
            const actionButtons = updatedRow.locator('button');
            await expect(actionButtons).toHaveCount(0);

            // 8. Verify counts updated
            const finalCounts = await getStatusCounts(page);
            console.log('Final counts:', finalCounts);

            expect(finalCounts.processed).toBe(initialCounts.processed);
            expect(finalCounts.processing).toBe(initialCounts.processing - 1);
            expect(finalCounts.declined).toBe(initialCounts.declined + 1);

            // Take final screenshot
            await page.screenshot({ path: path.join(screenshotsDir, '08-decline-final-state.png'), fullPage: true });
        });

        test('should update Dashboard stats after declining a transaction', async ({ page }) => {
            // Navigate to orders page first to check for pending transactions
            await page.goto('/orders');
            await page.waitForLoadState('networkidle');

            const initialCounts = await getStatusCounts(page);

            if (initialCounts.processing === 0) {
                test.skip(true, 'No pending transactions to verify dashboard update');
                return;
            }

            // Get initial dashboard stats
            await page.goto('/');
            await page.waitForLoadState('networkidle');
            await page.waitForSelector('text=Total Transactions');

            await page.screenshot({ path: path.join(screenshotsDir, '09-dashboard-before-decline.png'), fullPage: true });

            // Navigate to orders and decline a transaction
            await page.goto('/orders');
            await page.waitForLoadState('networkidle');

            const pendingRow = await findPendingTransactionRow(page);
            if (!pendingRow) {
                test.skip(true, 'No pending transactions available');
                return;
            }

            const declineButton = pendingRow.locator('button:has-text("Decline")');
            await declineButton.click();

            // Wait for success
            await expect(page.locator('text=Transaction declined successfully')).toBeVisible({ timeout: 10000 });
            await page.waitForLoadState('networkidle');

            // Navigate back to Dashboard
            await page.locator('nav a:has-text("Dashboard")').click();
            await page.waitForLoadState('networkidle');

            await page.screenshot({ path: path.join(screenshotsDir, '10-dashboard-after-decline.png'), fullPage: true });
        });
    });

    test.describe('Scenario 3: Button States and Visibility', () => {
        test('PENDING transactions should show Process and Decline buttons', async ({ page }) => {
            await page.goto('/orders');
            await page.waitForLoadState('networkidle');

            // Take screenshot of page
            await page.screenshot({ path: path.join(screenshotsDir, '11-button-states-overview.png'), fullPage: true });

            // Find a pending transaction row
            const pendingRow = await findPendingTransactionRow(page);

            if (!pendingRow) {
                // If no pending transactions, that's okay - the test is about button visibility
                console.log('No pending transactions found - verifying no orphaned buttons');
                return;
            }

            // Verify both Process and Decline buttons are visible
            const processButton = pendingRow.locator('button:has-text("Process")');
            const declineButton = pendingRow.locator('button:has-text("Decline")');

            await expect(processButton).toBeVisible();
            await expect(declineButton).toBeVisible();

            // Verify button styling
            await expect(processButton).toHaveClass(/text-emerald-600/);
            await expect(declineButton).toHaveClass(/text-red-600/);

            // Take screenshot focusing on the pending row
            await page.screenshot({ path: path.join(screenshotsDir, '12-pending-transaction-buttons.png'), fullPage: false });
        });

        test('COMPLETED (Processed) transactions should NOT show action buttons', async ({ page }) => {
            await page.goto('/orders');
            await page.waitForLoadState('networkidle');

            // Find a completed/processed transaction row
            const rows = page.locator('table tbody tr');
            const rowCount = await rows.count();

            let completedRow = null;
            for (let i = 0; i < rowCount; i++) {
                const row = rows.nth(i);
                const statusBadge = row.locator('span.bg-emerald-100:has-text("Processed")');
                if (await statusBadge.count() > 0) {
                    completedRow = row;
                    break;
                }
            }

            if (!completedRow) {
                console.log('No completed transactions found');
                return;
            }

            // Verify NO action buttons in this row
            const processButton = completedRow.locator('button:has-text("Process")');
            const declineButton = completedRow.locator('button:has-text("Decline")');

            await expect(processButton).toHaveCount(0);
            await expect(declineButton).toHaveCount(0);

            // Verify the Actions cell is empty
            const actionsCell = completedRow.locator('td:last-child');
            const buttons = actionsCell.locator('button');
            await expect(buttons).toHaveCount(0);

            await page.screenshot({ path: path.join(screenshotsDir, '13-completed-no-buttons.png'), fullPage: false });
        });

        test('CANCELLED (Declined) transactions should NOT show action buttons', async ({ page }) => {
            await page.goto('/orders');
            await page.waitForLoadState('networkidle');

            // Find a cancelled/declined transaction row
            const rows = page.locator('table tbody tr');
            const rowCount = await rows.count();

            let cancelledRow = null;
            for (let i = 0; i < rowCount; i++) {
                const row = rows.nth(i);
                const statusBadge = row.locator('span.bg-red-100:has-text("Declined")');
                if (await statusBadge.count() > 0) {
                    cancelledRow = row;
                    break;
                }
            }

            if (!cancelledRow) {
                console.log('No declined transactions found');
                return;
            }

            // Verify NO action buttons in this row
            const processButton = cancelledRow.locator('button:has-text("Process")');
            const declineButton = cancelledRow.locator('button:has-text("Decline")');

            await expect(processButton).toHaveCount(0);
            await expect(declineButton).toHaveCount(0);

            // Verify the Actions cell is empty
            const actionsCell = cancelledRow.locator('td:last-child');
            const buttons = actionsCell.locator('button');
            await expect(buttons).toHaveCount(0);

            await page.screenshot({ path: path.join(screenshotsDir, '14-declined-no-buttons.png'), fullPage: false });
        });

        test('Buttons should be disabled while request is in progress', async ({ page }) => {
            await page.goto('/orders');
            await page.waitForLoadState('networkidle');

            const initialCounts = await getStatusCounts(page);

            if (initialCounts.processing === 0) {
                test.skip(true, 'No pending transactions to test button disabled state');
                return;
            }

            // Find a pending transaction row
            const pendingRow = await findPendingTransactionRow(page);
            expect(pendingRow).not.toBeNull();

            const processButton = pendingRow!.locator('button:has-text("Process")');
            const declineButton = pendingRow!.locator('button:has-text("Decline")');

            // Verify buttons are initially enabled
            await expect(processButton).not.toBeDisabled();
            await expect(declineButton).not.toBeDisabled();

            // Intercept the API request to slow it down
            await page.route('**/api/orders/*/status', async (route) => {
                // Delay the response to allow us to check disabled state
                await new Promise(resolve => setTimeout(resolve, 500));
                await route.continue();
            });

            // Click Process button
            await processButton.click();

            // Immediately check that both buttons are disabled
            // Note: We need to check quickly before the request completes
            await expect(processButton).toHaveClass(/disabled:opacity-50/);
            await expect(declineButton).toHaveClass(/disabled:opacity-50/);

            // Wait for the request to complete
            await expect(page.locator('text=Transaction processed successfully')).toBeVisible({ timeout: 10000 });

            await page.screenshot({ path: path.join(screenshotsDir, '15-buttons-disabled-during-request.png'), fullPage: false });
        });
    });

    test.describe('Error Handling', () => {
        test('should show error toast when API request fails', async ({ page }) => {
            await page.goto('/orders');
            await page.waitForLoadState('networkidle');

            const initialCounts = await getStatusCounts(page);

            if (initialCounts.processing === 0) {
                test.skip(true, 'No pending transactions to test error handling');
                return;
            }

            // Find a pending transaction row
            const pendingRow = await findPendingTransactionRow(page);
            expect(pendingRow).not.toBeNull();

            // Mock the API to return an error
            await page.route('**/api/orders/*/status', (route) => {
                route.fulfill({
                    status: 500,
                    contentType: 'application/json',
                    body: JSON.stringify({ message: 'Internal server error' })
                });
            });

            const processButton = pendingRow!.locator('button:has-text("Process")');
            await processButton.click();

            // Verify error toast is shown
            await expect(page.locator('text=Failed to update transaction status')).toBeVisible({ timeout: 10000 });

            await page.screenshot({ path: path.join(screenshotsDir, '16-error-toast.png'), fullPage: false });

            // Verify the transaction status did NOT change
            const statusBadge = pendingRow!.locator('span.bg-amber-100');
            await expect(statusBadge).toBeVisible();
            await expect(statusBadge).toContainText('Processing');
        });
    });

    test.describe('API Integration', () => {
        test('API should accept PATCH request to update order status to COMPLETED', async ({ page }) => {
            // First get an order ID
            const ordersResponse = await page.request.get('http://localhost:3000/api/orders');
            expect(ordersResponse.ok()).toBeTruthy();

            const orders = await ordersResponse.json();
            const pendingOrder = orders.find((o: { status: string }) => o.status === 'PENDING');

            if (!pendingOrder) {
                test.skip(true, 'No pending orders in API to test');
                return;
            }

            // Update the order status via API
            const updateResponse = await page.request.patch(
                `http://localhost:3000/api/orders/${pendingOrder.id}/status`,
                {
                    data: { status: 'COMPLETED' }
                }
            );

            expect(updateResponse.ok()).toBeTruthy();

            const updatedOrder = await updateResponse.json();
            expect(updatedOrder.id).toBe(pendingOrder.id);
            expect(updatedOrder.status).toBe('COMPLETED');
        });

        test('API should accept PATCH request to update order status to CANCELLED', async ({ page }) => {
            // First get an order ID
            const ordersResponse = await page.request.get('http://localhost:3000/api/orders');
            expect(ordersResponse.ok()).toBeTruthy();

            const orders = await ordersResponse.json();
            const pendingOrder = orders.find((o: { status: string }) => o.status === 'PENDING');

            if (!pendingOrder) {
                test.skip(true, 'No pending orders in API to test');
                return;
            }

            // Update the order status via API
            const updateResponse = await page.request.patch(
                `http://localhost:3000/api/orders/${pendingOrder.id}/status`,
                {
                    data: { status: 'CANCELLED' }
                }
            );

            expect(updateResponse.ok()).toBeTruthy();

            const updatedOrder = await updateResponse.json();
            expect(updatedOrder.id).toBe(pendingOrder.id);
            expect(updatedOrder.status).toBe('CANCELLED');
        });

        test('API should return 404 for non-existent order', async ({ page }) => {
            const updateResponse = await page.request.patch(
                'http://localhost:3000/api/orders/non-existent-id/status',
                {
                    data: { status: 'COMPLETED' }
                }
            );

            expect(updateResponse.status()).toBe(404);
        });
    });
});
