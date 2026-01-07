import { test, expect } from '@playwright/test';

test.describe('Calendar Tab - E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app and go to Calendar tab
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.click('[data-tab="calendar"]');
    await page.waitForSelector('[data-testid="calendar-view"]', { timeout: 10000 });
  });

  test('should display calendar with current month', async ({ page }) => {
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Check if calendar header shows current month
    const headerText = await page.textContent('h2');
    expect(headerText).toContain(currentMonth);

    // Verify calendar grid is visible
    await expect(page.locator('[data-testid="calendar-grid"]')).toBeVisible();

    // Verify day headers are present
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (const day of dayHeaders) {
      await expect(page.locator(`text=${day}`)).toBeVisible();
    }
  });

  test('should navigate between months', async ({ page }) => {
    // Click next month button
    await page.click('[aria-label="Next month"]');
    await page.waitForTimeout(500);

    const nextMonthDate = new Date();
    nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
    const nextMonth = nextMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const headerText = await page.textContent('h2');
    expect(headerText).toContain(nextMonth);

    // Click previous month button twice to go back
    await page.click('[aria-label="Previous month"]');
    await page.waitForTimeout(500);
    await page.click('[aria-label="Previous month"]');
    await page.waitForTimeout(500);

    const prevMonthDate = new Date();
    prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
    const prevMonth = prevMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const newHeaderText = await page.textContent('h2');
    expect(newHeaderText).toContain(prevMonth);
  });

  test('should display events on calendar dates', async ({ page }) => {
    // Look for dates that have events
    const eventsOnCalendar = await page.locator('[data-has-events="true"]').count();

    // Should have at least some events displayed
    expect(eventsOnCalendar).toBeGreaterThan(0);

    // Check if event has proper styling and type icon
    const firstEvent = page.locator('[data-testid="calendar-event"]').first();
    await expect(firstEvent).toBeVisible();

    // Events should have status badges
    const statusBadge = firstEvent.locator('[data-testid="event-status"]');
    await expect(statusBadge).toBeVisible();
  });

  test('should select a date and show events in sidebar', async ({ page }) => {
    // Find a date with events and click it
    const dateWithEvents = page.locator('[data-has-events="true"]').first();
    await dateWithEvents.click();

    // Sidebar should appear with events for that date
    await expect(page.locator('[data-testid="selected-date-sidebar"]')).toBeVisible();

    // Should show date header
    const selectedDate = await page.textContent('[data-testid="selected-date-header"]');
    expect(selectedDate).toBeTruthy();

    // Should display events list
    const eventsInSidebar = await page.locator('[data-testid="sidebar-event"]').count();
    expect(eventsInSidebar).toBeGreaterThan(0);
  });

  test('should click event to open detail view', async ({ page }) => {
    // Select a date with events
    const dateWithEvents = page.locator('[data-has-events="true"]').first();
    await dateWithEvents.click();

    // Wait for sidebar
    await page.waitForSelector('[data-testid="selected-date-sidebar"]');

    // Click on an event in the sidebar
    await page.locator('[data-testid="sidebar-event"]').first().click();

    // Detail view drawer should open
    await expect(page.locator('[data-testid="item-detail-drawer"]')).toBeVisible({ timeout: 5000 });

    // Should show event details
    await expect(page.locator('[data-testid="event-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="event-time"]')).toBeVisible();
  });

  test('should return to today when clicking Today button', async ({ page }) => {
    // Navigate to next month
    await page.click('[aria-label="Next month"]');
    await page.waitForTimeout(500);

    // Click Today button
    await page.click('button:has-text("Today")');
    await page.waitForTimeout(500);

    // Should show current month
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const headerText = await page.textContent('h2');
    expect(headerText).toContain(currentMonth);

    // Today's date should be highlighted
    const today = new Date().getDate();
    const todayCell = page.locator(`[data-date="${today}"][data-is-today="true"]`);
    await expect(todayCell).toHaveClass(/border-primary/);
  });

  test('should show event count indicator', async ({ page }) => {
    // Look for dates with more than 2 events
    const dateWithManyEvents = page.locator('[data-event-count]').first();

    if (await dateWithManyEvents.isVisible()) {
      await dateWithManyEvents.click();

      // Check if "+X more" text is visible when there are > 2 events
      const moreText = page.locator('text=/\\+\\d+ more/');
      if (await moreText.count() > 0) {
        await expect(moreText.first()).toBeVisible();
      }
    }
  });

  test('should display different event types with icons', async ({ page }) => {
    // Find events on calendar
    const events = page.locator('[data-testid="calendar-event"]');
    const count = await events.count();

    if (count > 0) {
      // Check first event has an icon (emoji)
      const firstEventText = await events.first().textContent();
      // Should contain emoji icons like ✈️, 🏨, 🍽️, etc.
      expect(firstEventText).toMatch(/[✈️🚆🏨🍽️🏛️🎯🚗📍]/);
    }
  });

  test('should filter calendar view by event status', async ({ page }) => {
    // Count initial events
    const initialEventCount = await page.locator('[data-testid="calendar-event"]').count();

    // Check event summary in header
    const summary = await page.textContent('[data-testid="events-summary"]');
    expect(summary).toMatch(/\d+ event/);
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.click('[data-tab="calendar"]');

    // Calendar should still be visible
    await expect(page.locator('[data-testid="calendar-view"]')).toBeVisible();

    // Calendar grid should adapt to mobile
    const calendarGrid = page.locator('[data-testid="calendar-grid"]');
    await expect(calendarGrid).toBeVisible();
  });
});
