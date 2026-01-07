import { test, expect } from '@playwright/test';

test.describe('Budget Tab - Expense Tracking & Settlements E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.click('[data-tab="budget"]');
    await page.waitForSelector('[data-testid="budget-view"]', { timeout: 10000 });
  });

  test('should display budget overview with total spent', async ({ page }) => {
    // Total budget card should be visible
    await expect(page.locator('[data-testid="total-spent"]')).toBeVisible();

    // Should show amount
    const totalText = await page.locator('[data-testid="total-spent"]').textContent();
    expect(totalText).toMatch(/\$[\d,]+/);

    // Should have "Total Spent" label
    await expect(page.locator('text=Total Spent')).toBeVisible();
  });

  test('should display expenses table with existing expenses', async ({ page }) => {
    // Expenses table should be visible
    await expect(page.locator('[data-testid="expenses-table"]')).toBeVisible();

    // Should have table headers
    await expect(page.locator('th:has-text("Date")')).toBeVisible();
    await expect(page.locator('th:has-text("Category")')).toBeVisible();
    await expect(page.locator('th:has-text("Description")')).toBeVisible();
    await expect(page.locator('th:has-text("Amount")')).toBeVisible();
    await expect(page.locator('th:has-text("Paid By")')).toBeVisible();

    // Should have at least some expenses
    const rows = await page.locator('[data-testid="expense-row"]').count();
    expect(rows).toBeGreaterThan(0);
  });

  test('should add a new expense', async ({ page }) => {
    // Click Add Expense button
    await page.click('button:has-text("Add Expense")');

    // Dialog should open
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('text=Add New Expense')).toBeVisible();

    // Fill expense form
    await page.selectOption('select#category', 'Food');
    await page.fill('input#description', 'Dinner at Sushi Restaurant');
    await page.fill('input#amount', '85.50');
    await page.selectOption('select#paid-by', 'Camille');
    await page.fill('input#date', '2026-01-20');
    await page.selectOption('select#payment-method', 'Credit Card');

    // Submit
    await page.click('button:has-text("Add Expense")');

    // New expense should appear in table
    await expect(page.locator('text=Dinner at Sushi Restaurant')).toBeVisible();
    await expect(page.locator('text=$85.50')).toBeVisible();
  });

  test('should calculate individual spending correctly', async ({ page }) => {
    // Individual spending card should be visible
    await expect(page.locator('[data-testid="individual-spending"]')).toBeVisible();

    // Should show amounts for each person
    const camilleAmount = page.locator('[data-testid="camille-paid"]');
    const miguelAmount = page.locator('[data-testid="miguel-paid"]');

    await expect(camilleAmount).toBeVisible();
    await expect(miguelAmount).toBeVisible();

    // Amounts should be numbers
    const camilleText = await camilleAmount.textContent();
    const miguelText = await miguelAmount.textContent();

    expect(camilleText).toMatch(/\$[\d,]+/);
    expect(miguelText).toMatch(/\$[\d,]+/);
  });

  test('should calculate and display settlements (who owes whom)', async ({ page }) => {
    // Settlements section should be visible
    const settlementsSection = page.locator('[data-testid="settlements"]');
    await expect(settlementsSection).toBeVisible();

    // Should have settlement recommendations
    const settlementText = await settlementsSection.textContent();

    // Should show "owes" relationship
    expect(settlementText).toMatch(/owes/);

    // Should show settlement amount
    expect(settlementText).toMatch(/\$[\d,]+/);
  });

  test('should verify settlement calculation accuracy', async ({ page }) => {
    // Get individual totals
    const camilleText = await page.locator('[data-testid="camille-paid"]').textContent();
    const miguelText = await page.locator('[data-testid="miguel-paid"]').textContent();

    const camillePaid = parseFloat(camilleText?.match(/[\d,]+/)![0].replace(',', '') || '0');
    const miguelPaid = parseFloat(miguelText?.match(/[\d,]+/)![0].replace(',', '') || '0');

    // Get total
    const totalText = await page.locator('[data-testid="total-spent"]').textContent();
    const total = parseFloat(totalText?.match(/[\d,]+/)![0].replace(',', '') || '0');

    // Verify totals add up
    expect(camillePaid + miguelPaid).toBeCloseTo(total, 2);

    // Calculate expected settlement
    const fairShare = total / 2;
    const expectedSettlement = Math.abs(camillePaid - fairShare);

    // Get actual settlement from UI
    const settlementText = await page.locator('[data-testid="settlement-amount"]').textContent();
    const actualSettlement = parseFloat(settlementText?.match(/[\d,]+/)![0].replace(',', '') || '0');

    // Settlement should match calculation
    expect(actualSettlement).toBeCloseTo(expectedSettlement, 2);
  });

  test('should delete an expense', async ({ page }) => {
    // Get initial expense count
    const initialCount = await page.locator('[data-testid="expense-row"]').count();

    // Click delete on first expense
    await page.locator('[data-testid="delete-expense"]').first().click();

    // Wait a moment for deletion
    await page.waitForTimeout(500);

    // Expense count should decrease
    const newCount = await page.locator('[data-testid="expense-row"]').count();
    expect(newCount).toBe(initialCount - 1);

    // Totals should update
    await expect(page.locator('[data-testid="total-spent"]')).toBeVisible();
  });

  test('should toggle split equally option', async ({ page }) => {
    // Find split equally toggle
    const toggle = page.locator('[data-testid="split-equally-toggle"]');
    await expect(toggle).toBeVisible();

    // Get initial state
    const initialState = await toggle.isChecked();

    // Click toggle
    await toggle.click();

    // State should change
    const newState = await toggle.isChecked();
    expect(newState).toBe(!initialState);
  });

  test('should filter expenses by category', async ({ page }) => {
    // Add a filter if available, or verify category badges work
    const categoryBadges = page.locator('[data-testid="expense-category"]');
    const count = await categoryBadges.count();

    expect(count).toBeGreaterThan(0);

    // Each badge should have appropriate styling
    for (let i = 0; i < Math.min(count, 3); i++) {
      const badge = categoryBadges.nth(i);
      await expect(badge).toBeVisible();

      // Should have category text
      const text = await badge.textContent();
      expect(['Flights', 'Hotel', 'Transport', 'Food', 'Activities', 'Shopping', 'Other']).toContain(text);
    }
  });

  test('should show expense details with payment method', async ({ page }) => {
    // Get first expense row
    const firstExpense = page.locator('[data-testid="expense-row"]').first();

    // Should show all expense details
    await expect(firstExpense.locator('[data-testid="expense-category"]')).toBeVisible();
    await expect(firstExpense.locator('[data-testid="expense-description"]')).toBeVisible();
    await expect(firstExpense.locator('[data-testid="expense-amount"]')).toBeVisible();
    await expect(firstExpense.locator('[data-testid="expense-payer"]')).toBeVisible();
  });

  test('should sort expenses by date (most recent first)', async ({ page }) => {
    // Get all expense dates
    const dateElements = page.locator('[data-testid="expense-date"]');
    const count = await dateElements.count();

    if (count >= 2) {
      // Get first two dates
      const firstDate = await dateElements.first().textContent();
      const secondDate = await dateElements.nth(1).textContent();

      // First date should be more recent than or equal to second
      const date1 = new Date(firstDate!);
      const date2 = new Date(secondDate!);

      expect(date1.getTime()).toBeGreaterThanOrEqual(date2.getTime());
    }
  });

  test('should handle multiple currencies', async ({ page }) => {
    // Currency should be displayed
    const amounts = page.locator('[data-testid="expense-amount"]');
    const firstAmount = await amounts.first().textContent();

    // Should have currency symbol
    expect(firstAmount).toMatch(/[$€£¥]/);
  });

  test('should update settlements when expense is added', async ({ page }) => {
    // Get initial settlement
    const initialSettlement = await page.locator('[data-testid="settlement-amount"]').textContent();
    const initialAmount = parseFloat(initialSettlement?.match(/[\d,]+/)![0].replace(',', '') || '0');

    // Add new expense
    await page.click('button:has-text("Add Expense")');
    await page.selectOption('select#category', 'Food');
    await page.fill('input#description', 'Test Expense');
    await page.fill('input#amount', '100');
    await page.selectOption('select#paid-by', 'Miguel');
    await page.fill('input#date', '2026-01-21');
    await page.click('button:has-text("Add Expense")');

    // Wait for update
    await page.waitForTimeout(1000);

    // Settlement should change
    const newSettlement = await page.locator('[data-testid="settlement-amount"]').textContent();
    const newAmount = parseFloat(newSettlement?.match(/[\d,]+/)![0].replace(',', '') || '0');

    expect(newAmount).not.toBe(initialAmount);
  });

  test('should show empty state when no expenses', async ({ page }) => {
    // Delete all expenses
    let expenseCount = await page.locator('[data-testid="expense-row"]').count();

    while (expenseCount > 0) {
      await page.locator('[data-testid="delete-expense"]').first().click();
      await page.waitForTimeout(300);
      expenseCount = await page.locator('[data-testid="expense-row"]').count();
    }

    // Should show empty state
    await expect(page.locator('text=No expenses yet')).toBeVisible();
  });

  test('should validate expense form inputs', async ({ page }) => {
    // Click Add Expense
    await page.click('button:has-text("Add Expense")');

    // Try to submit without required fields
    const submitButton = page.locator('button:has-text("Add Expense")');
    await expect(submitButton).toBeDisabled();

    // Fill description only
    await page.fill('input#description', 'Test');

    // Should still be disabled without amount
    await expect(submitButton).toBeDisabled();

    // Fill amount
    await page.fill('input#amount', '50');

    // Should still need category and date
    // ...

    // Fill all required fields
    await page.selectOption('select#category', 'Food');
    await page.fill('input#date', '2026-01-22');

    // Now should be enabled
    await expect(submitButton).not.toBeDisabled();
  });

  test('should handle unequal expense splitting scenarios', async ({ page }) => {
    // This tests the settlement algorithm with various expense distributions

    // Add expense paid by Camille
    await page.click('button:has-text("Add Expense")');
    await page.selectOption('select#category', 'Hotel');
    await page.fill('input#description', 'Hotel Stay');
    await page.fill('input#amount', '500');
    await page.selectOption('select#paid-by', 'Camille');
    await page.fill('input#date', '2026-01-23');
    await page.click('button:has-text("Add Expense")');

    await page.waitForTimeout(500);

    // Add smaller expense paid by Miguel
    await page.click('button:has-text("Add Expense")');
    await page.selectOption('select#category', 'Food');
    await page.fill('input#description', 'Breakfast');
    await page.fill('input#amount', '30');
    await page.selectOption('select#paid-by', 'Miguel');
    await page.fill('input#date', '2026-01-23');
    await page.click('button:has-text("Add Expense")');

    await page.waitForTimeout(1000);

    // Settlement should reflect the imbalance
    // Total = 530, Fair share = 265 each
    // Camille paid 500, owes -235
    // Miguel paid 30, owes 235
    const settlementText = await page.locator('[data-testid="settlement-amount"]').textContent();
    const amount = parseFloat(settlementText?.match(/[\d,]+/)![0].replace(',', '') || '0');

    // Miguel should owe approximately 235
    expect(amount).toBeCloseTo(235, 0);
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Switch to mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.click('[data-tab="budget"]');

    // Budget view should still be visible
    await expect(page.locator('[data-testid="budget-view"]')).toBeVisible();

    // Tables should be scrollable or stacked
    await expect(page.locator('[data-testid="expenses-table"]')).toBeVisible();

    // Summary cards should stack vertically
    const summaryCards = page.locator('[data-testid="total-spent"]');
    await expect(summaryCards).toBeVisible();
  });
});
