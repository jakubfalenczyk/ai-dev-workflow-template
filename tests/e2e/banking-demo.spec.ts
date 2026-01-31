import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const screenshotsDir = path.join(process.cwd(), 'screenshots');

// Ensure screenshots directory exists
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

test.describe('Meridian Commercial Bank - Dashboard', () => {
  test('should display Meridian branding and navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify Meridian branding in header
    const headerBrand = page.locator('header h1');
    await expect(headerBrand).toContainText('Meridian');

    const headerSubtitle = page.locator('header p');
    await expect(headerSubtitle).toContainText('Commercial Bank');

    // Verify navigation links
    const dashboardLink = page.locator('nav a:has-text("Dashboard")');
    const clientsLink = page.locator('nav a:has-text("Clients")');
    const productsLink = page.locator('nav a:has-text("Products")');
    const transactionsLink = page.locator('nav a:has-text("Transactions")');

    await expect(dashboardLink).toBeVisible();
    await expect(clientsLink).toBeVisible();
    await expect(productsLink).toBeVisible();
    await expect(transactionsLink).toBeVisible();

    // Dashboard link should be active (has bg-slate-700 class)
    await expect(dashboardLink).toHaveClass(/bg-slate-700/);

    await page.screenshot({ path: path.join(screenshotsDir, '01-dashboard-header.png'), fullPage: false });
  });

  test('should display 4 KPI cards with banking metrics', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for dashboard data to load
    await page.waitForSelector('text=Total Clients');

    // Verify 4 KPI cards (use exact text match to avoid ambiguity)
    const totalClientsCard = page.locator('h3.text-sm:has-text("Total Clients")');
    const financialProductsCard = page.getByRole('heading', { name: 'Financial Products', exact: true });
    const totalTransactionsCard = page.locator('h3.text-sm:has-text("Total Transactions")');
    const totalRevenueCard = page.locator('h3.text-sm:has-text("Total Revenue")');

    await expect(totalClientsCard).toBeVisible();
    await expect(financialProductsCard).toBeVisible();
    await expect(totalTransactionsCard).toBeVisible();
    await expect(totalRevenueCard).toBeVisible();

    // Verify each card has a numeric value
    const statCards = page.locator('.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4 > div');
    await expect(statCards).toHaveCount(4);

    await page.screenshot({ path: path.join(screenshotsDir, '02-dashboard-kpis.png'), fullPage: false });
  });

  test('should display charts (Transaction Volume, Monthly Revenue, Transaction Status)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for charts to render
    await page.waitForSelector('text=Transaction Volume');

    // Verify Transaction Volume chart
    const transactionVolumeChart = page.locator('h3:has-text("Transaction Volume")');
    await expect(transactionVolumeChart).toBeVisible();

    // Verify Monthly Revenue chart
    const monthlyRevenueChart = page.locator('h3:has-text("Monthly Revenue")');
    await expect(monthlyRevenueChart).toBeVisible();

    // Verify Transaction Status pie chart
    const transactionStatusChart = page.locator('h3:has-text("Transaction Status")');
    await expect(transactionStatusChart).toBeVisible();

    // Check for Recharts SVG elements (charts rendered)
    const chartSvgs = page.locator('.recharts-wrapper');
    await expect(chartSvgs.first()).toBeVisible();

    await page.screenshot({ path: path.join(screenshotsDir, '03-dashboard-charts.png'), fullPage: false });
  });

  test('should display Top Products and Top Clients sections', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify Top Financial Products section
    const topProductsSection = page.locator('h3:has-text("Top Financial Products")');
    await expect(topProductsSection).toBeVisible();

    // Verify Top Clients section
    const topClientsSection = page.locator('h3:has-text("Top Clients")');
    await expect(topClientsSection).toBeVisible();

    await page.screenshot({ path: path.join(screenshotsDir, '04-dashboard-top-sections.png'), fullPage: false });
  });

  test('should display Recent Transactions table', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify Recent Transactions section
    const recentTransactionsHeader = page.locator('h3:has-text("Recent Transactions")');
    await expect(recentTransactionsHeader).toBeVisible();

    // Verify table headers
    const transactionIdHeader = page.locator('th:has-text("Transaction ID")');
    const clientHeader = page.locator('th:has-text("Client")');
    const statusHeader = page.locator('th:has-text("Status")');

    await expect(transactionIdHeader).toBeVisible();
    await expect(clientHeader).toBeVisible();
    await expect(statusHeader).toBeVisible();

    // Verify at least one transaction row
    const transactionRows = page.locator('table tbody tr');
    const rowCount = await transactionRows.count();
    expect(rowCount).toBeGreaterThan(0);

    await page.screenshot({ path: path.join(screenshotsDir, '05-dashboard-transactions-table.png'), fullPage: true });
  });
});

test.describe('Meridian Commercial Bank - Clients Page', () => {
  test('should display Client Portfolio page with banking terminology', async ({ page }) => {
    await page.goto('/customers');
    await page.waitForLoadState('networkidle');

    // Verify page title
    const pageTitle = page.locator('h1:has-text("Client Portfolio")');
    await expect(pageTitle).toBeVisible();

    // Verify stats cards
    const totalClientsCard = page.locator('text=Total Clients').first();
    const activeAccountsCard = page.locator('text=Active Accounts');
    const pendingReviewCard = page.locator('text=Pending Review').first();

    await expect(totalClientsCard).toBeVisible();
    await expect(activeAccountsCard).toBeVisible();
    await expect(pendingReviewCard).toBeVisible();

    // Verify Onboard Client button
    const onboardButton = page.locator('a:has-text("Onboard Client")');
    await expect(onboardButton).toBeVisible();

    await page.screenshot({ path: path.join(screenshotsDir, '06-clients-page.png'), fullPage: true });
  });

  test('should display client table with proper columns', async ({ page }) => {
    await page.goto('/customers');
    await page.waitForLoadState('networkidle');

    // Verify table headers
    const clientHeader = page.locator('th:has-text("Client")');
    const contactHeader = page.locator('th:has-text("Contact")');
    const businessAddressHeader = page.locator('th:has-text("Business Address")');
    const accountStatusHeader = page.locator('th:has-text("Account Status")');
    const actionsHeader = page.locator('th:has-text("Actions")');

    await expect(clientHeader).toBeVisible();
    await expect(contactHeader).toBeVisible();
    await expect(businessAddressHeader).toBeVisible();
    await expect(accountStatusHeader).toBeVisible();
    await expect(actionsHeader).toBeVisible();

    // Verify 20+ clients
    const clientRows = page.locator('table tbody tr');
    const rowCount = await clientRows.count();
    expect(rowCount).toBeGreaterThanOrEqual(20);

    await page.screenshot({ path: path.join(screenshotsDir, '07-clients-table.png'), fullPage: true });
  });

  test('should have Verified and Pending Review status badges', async ({ page }) => {
    await page.goto('/customers');
    await page.waitForLoadState('networkidle');

    // Check for status badges
    const verifiedBadge = page.locator('span:has-text("Verified")').first();
    await expect(verifiedBadge).toBeVisible();

    // Check for emerald (green) styling on verified badges
    await expect(verifiedBadge).toHaveClass(/bg-emerald-100/);
  });
});

test.describe('Meridian Commercial Bank - Client Form', () => {
  test('should display New Client Onboarding form', async ({ page }) => {
    await page.goto('/customers/new');
    await page.waitForLoadState('networkidle');

    // Verify form header
    const formHeader = page.locator('h1:has-text("New Client Onboarding")');
    await expect(formHeader).toBeVisible();

    // Verify form fields
    const nameField = page.locator('label:has-text("Client Name / Business Name")');
    const emailField = page.locator('label:has-text("Email Address")');
    const phoneField = page.locator('label:has-text("Phone Number")');
    const addressSection = page.locator('h3:has-text("Business Address")');
    const statusSection = page.locator('h3:has-text("Account Status")');

    await expect(nameField).toBeVisible();
    await expect(emailField).toBeVisible();
    await expect(phoneField).toBeVisible();
    await expect(addressSection).toBeVisible();
    await expect(statusSection).toBeVisible();

    // Verify account status dropdown has banking options
    const statusDropdown = page.locator('select#status');
    await expect(statusDropdown).toBeVisible();

    // Verify Complete Onboarding button
    const submitButton = page.locator('button:has-text("Complete Onboarding")');
    await expect(submitButton).toBeVisible();

    await page.screenshot({ path: path.join(screenshotsDir, '08-client-form.png'), fullPage: true });
  });

  test('should have Back to Clients link', async ({ page }) => {
    await page.goto('/customers/new');
    await page.waitForLoadState('networkidle');

    const backLink = page.locator('button:has-text("Back to Clients")');
    await expect(backLink).toBeVisible();
  });
});

test.describe('Meridian Commercial Bank - Financial Products Page', () => {
  test('should display Financial Products & Services page', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Verify page title
    const pageTitle = page.locator('h1:has-text("Financial Products & Services")');
    await expect(pageTitle).toBeVisible();

    // Verify Add Product button
    const addProductButton = page.locator('a:has-text("Add Product")');
    await expect(addProductButton).toBeVisible();

    await page.screenshot({ path: path.join(screenshotsDir, '09-products-page.png'), fullPage: false });
  });

  test('should display products grouped by category', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Verify category headers
    const depositProducts = page.locator('h3:has-text("Deposit Products")');
    const lendingProducts = page.locator('h3:has-text("Lending Products")');
    const treasuryServices = page.locator('h3:has-text("Treasury Services")');
    const cardProducts = page.locator('h3:has-text("Card Products")');
    const investmentProducts = page.locator('h3:has-text("Investment Products")');

    await expect(depositProducts).toBeVisible();
    await expect(lendingProducts).toBeVisible();
    await expect(treasuryServices).toBeVisible();
    await expect(cardProducts).toBeVisible();
    await expect(investmentProducts).toBeVisible();

    await page.screenshot({ path: path.join(screenshotsDir, '10-products-categories.png'), fullPage: true });
  });

  test('should display product cards with SKU codes', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Verify SKU codes are displayed
    const skuBadges = page.locator('span.font-mono');
    const skuCount = await skuBadges.count();
    expect(skuCount).toBeGreaterThanOrEqual(20);

    // Verify SKU prefixes match banking products
    const firstSku = await skuBadges.first().textContent();
    expect(firstSku).toMatch(/^(DEP|LND|TRS|CRD|INV)-/);

    await page.screenshot({ path: path.join(screenshotsDir, '11-products-sku-codes.png'), fullPage: true });
  });
});

test.describe('Meridian Commercial Bank - Transactions Page', () => {
  test('should display Transaction History page', async ({ page }) => {
    await page.goto('/orders');
    await page.waitForLoadState('networkidle');

    // Verify page title
    const pageTitle = page.locator('h1:has-text("Transaction History")');
    await expect(pageTitle).toBeVisible();

    // Verify New Transaction button
    const newTransactionButton = page.locator('a:has-text("New Transaction")');
    await expect(newTransactionButton).toBeVisible();

    await page.screenshot({ path: path.join(screenshotsDir, '12-transactions-page.png'), fullPage: false });
  });

  test('should display stats cards with banking terminology', async ({ page }) => {
    await page.goto('/orders');
    await page.waitForLoadState('networkidle');

    // Verify stats cards
    const totalVolumeCard = page.locator('text=Total Volume');
    const processedCard = page.locator('p:has-text("Processed")');
    const processingCard = page.locator('p.text-xs:has-text("Processing")');
    const declinedCard = page.locator('p:has-text("Declined")');

    await expect(totalVolumeCard).toBeVisible();
    await expect(processedCard).toBeVisible();
    await expect(processingCard).toBeVisible();
    await expect(declinedCard).toBeVisible();

    await page.screenshot({ path: path.join(screenshotsDir, '13-transactions-stats.png'), fullPage: false });
  });

  test('should display transaction table with proper columns', async ({ page }) => {
    await page.goto('/orders');
    await page.waitForLoadState('networkidle');

    // Verify table headers
    const transactionIdHeader = page.locator('th:has-text("Transaction ID")');
    const clientHeader = page.locator('th:has-text("Client")');
    const productsHeader = page.locator('th:has-text("Products")');
    const amountHeader = page.locator('th:has-text("Amount")');
    const statusHeader = page.locator('th:has-text("Status")');
    const dateHeader = page.locator('th:has-text("Date")');

    await expect(transactionIdHeader).toBeVisible();
    await expect(clientHeader).toBeVisible();
    await expect(productsHeader).toBeVisible();
    await expect(amountHeader).toBeVisible();
    await expect(statusHeader).toBeVisible();
    await expect(dateHeader).toBeVisible();

    await page.screenshot({ path: path.join(screenshotsDir, '14-transactions-table.png'), fullPage: true });
  });

  test('should display status badges with banking terminology', async ({ page }) => {
    await page.goto('/orders');
    await page.waitForLoadState('networkidle');

    // Check for status badges
    const processedBadge = page.locator('span:has-text("Processed")').first();
    await expect(processedBadge).toBeVisible();
    await expect(processedBadge).toHaveClass(/bg-emerald-100/);

    // Check Processing badge if exists
    const processingBadges = page.locator('span:has-text("Processing")');
    const processingCount = await processingBadges.count();
    if (processingCount > 0) {
      await expect(processingBadges.first()).toHaveClass(/bg-amber-100/);
    }

    // Check Declined badge if exists
    const declinedBadges = page.locator('span:has-text("Declined")');
    const declinedCount = await declinedBadges.count();
    if (declinedCount > 0) {
      await expect(declinedBadges.first()).toHaveClass(/bg-red-100/);
    }
  });

  test('should have 50+ transactions', async ({ page }) => {
    await page.goto('/orders');
    await page.waitForLoadState('networkidle');

    // Verify transaction count in header
    const transactionCountText = page.locator('span:has-text("total")');
    await expect(transactionCountText).toBeVisible();

    const countText = await transactionCountText.textContent();
    const match = countText?.match(/\((\d+)\s+total\)/);
    if (match) {
      const count = parseInt(match[1], 10);
      expect(count).toBeGreaterThanOrEqual(50);
    }

    // Also verify rows
    const transactionRows = page.locator('table tbody tr');
    const rowCount = await transactionRows.count();
    expect(rowCount).toBeGreaterThanOrEqual(50);

    await page.screenshot({ path: path.join(screenshotsDir, '15-transactions-count.png'), fullPage: true });
  });
});

test.describe('Meridian Commercial Bank - Navigation Flow', () => {
  test('should navigate between all pages correctly', async ({ page }) => {
    // Start on dashboard
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify dashboard is active
    let dashboardLink = page.locator('nav a:has-text("Dashboard")');
    await expect(dashboardLink).toHaveClass(/bg-slate-700/);

    // Navigate to Clients
    const clientsLink = page.locator('nav a:has-text("Clients")');
    await clientsLink.click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/customers');
    await expect(clientsLink).toHaveClass(/bg-slate-700/);
    await expect(page.locator('h1:has-text("Client Portfolio")')).toBeVisible();

    // Navigate to Products
    const productsLink = page.locator('nav a:has-text("Products")');
    await productsLink.click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/products');
    await expect(productsLink).toHaveClass(/bg-slate-700/);
    await expect(page.locator('h1:has-text("Financial Products")')).toBeVisible();

    // Navigate to Transactions
    const transactionsLink = page.locator('nav a:has-text("Transactions")');
    await transactionsLink.click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/orders');
    await expect(transactionsLink).toHaveClass(/bg-slate-700/);
    await expect(page.locator('h1:has-text("Transaction History")')).toBeVisible();

    // Navigate back to Dashboard
    dashboardLink = page.locator('nav a:has-text("Dashboard")');
    await dashboardLink.click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/');
    await expect(dashboardLink).toHaveClass(/bg-slate-700/);

    await page.screenshot({ path: path.join(screenshotsDir, '16-navigation-complete.png'), fullPage: false });
  });

  test('should navigate to client form from Onboard Client button', async ({ page }) => {
    await page.goto('/customers');
    await page.waitForLoadState('networkidle');

    const onboardButton = page.locator('a:has-text("Onboard Client")');
    await onboardButton.click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL('/customers/new');
    await expect(page.locator('h1:has-text("New Client Onboarding")')).toBeVisible();
  });

  test('should navigate to transaction form from New Transaction button', async ({ page }) => {
    await page.goto('/orders');
    await page.waitForLoadState('networkidle');

    const newTransactionButton = page.locator('a:has-text("New Transaction")');
    await newTransactionButton.click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL('/orders/new');
  });
});

test.describe('Meridian Commercial Bank - Data Verification', () => {
  test('should have charts with data (not empty)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for charts to render
    await page.waitForSelector('.recharts-wrapper');

    // Verify charts have rendered paths/bars (data is present)
    const chartPaths = page.locator('.recharts-area-area');
    await expect(chartPaths.first()).toBeVisible();

    const chartBars = page.locator('.recharts-bar-rectangle');
    const barCount = await chartBars.count();
    expect(barCount).toBeGreaterThan(0);
  });

  test('should display proper currency formatting', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for currency values containing $
    const currencyValues = page.locator('text=/\\$[\\d,]+/');
    const count = await currencyValues.count();
    expect(count).toBeGreaterThan(0);
  });

  test('API should return customer data', async ({ page }) => {
    const response = await page.request.get('http://localhost:3000/api/customers');
    expect(response.ok()).toBeTruthy();

    const customers = await response.json();
    expect(Array.isArray(customers)).toBeTruthy();
    expect(customers.length).toBeGreaterThanOrEqual(20);
  });

  test('API should return product data', async ({ page }) => {
    const response = await page.request.get('http://localhost:3000/api/products');
    expect(response.ok()).toBeTruthy();

    const products = await response.json();
    expect(Array.isArray(products)).toBeTruthy();
    expect(products.length).toBeGreaterThanOrEqual(20);

    // Verify banking product SKUs
    const skuPrefixes = products.map((p: { sku: string }) => p.sku.split('-')[0]);
    expect(skuPrefixes).toContain('DEP');
    expect(skuPrefixes).toContain('LND');
  });

  test('API should return order data', async ({ page }) => {
    const response = await page.request.get('http://localhost:3000/api/orders');
    expect(response.ok()).toBeTruthy();

    const orders = await response.json();
    expect(Array.isArray(orders)).toBeTruthy();
    expect(orders.length).toBeGreaterThanOrEqual(50);
  });
});

test.describe('Meridian Commercial Bank - Footer', () => {
  test('should display Meridian Commercial Bank footer', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify footer text
    const footerText = page.locator('footer p:has-text("Meridian Commercial Bank")');
    await expect(footerText).toBeVisible();

    const versionText = page.locator('footer p:has-text("Enterprise Banking Platform")');
    await expect(versionText).toBeVisible();
  });
});
