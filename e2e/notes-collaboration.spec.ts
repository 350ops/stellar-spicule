import { test, expect, Page } from '@playwright/test';

test.describe('Notes Tab - Collaborative Editing E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.click('[data-tab="notes"]');
    await page.waitForSelector('[data-testid="notes-view"]', { timeout: 10000 });
  });

  test('should display notes sidebar with existing notes', async ({ page }) => {
    // Notes sidebar should be visible
    await expect(page.locator('[data-testid="notes-sidebar"]')).toBeVisible();

    // Should have default notes
    await expect(page.locator('text=Packing List')).toBeVisible();
    await expect(page.locator('text=Food Research')).toBeVisible();
    await expect(page.locator('text=Travel Insurance')).toBeVisible();

    // Should have search box
    await expect(page.locator('[placeholder*="Search notes"]')).toBeVisible();

    // Should have New button
    await expect(page.locator('button:has-text("New")')).toBeVisible();
  });

  test('should create a new note', async ({ page }) => {
    // Click New button
    await page.click('button:has-text("New")');

    // Dialog should appear
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Enter note title
    await page.fill('[placeholder*="Restaurant Recommendations"]', 'Best Ramen Spots');

    // Click Create button
    await page.click('button:has-text("Create Note")');

    // New note should appear in sidebar
    await expect(page.locator('text=Best Ramen Spots')).toBeVisible();

    // Should be in edit mode
    await expect(page.locator('textarea')).toBeVisible();
  });

  test('should edit note content', async ({ page }) => {
    // Select first note
    await page.locator('[data-testid="note-item"]').first().click();

    // Click edit button
    await page.click('[aria-label="Edit note"]');

    // Content area should be in edit mode
    const textarea = page.locator('textarea[placeholder*="Write your note"]');
    await expect(textarea).toBeVisible();

    // Type new content
    await textarea.fill('# Updated Content\\n\\nThis is new content for the note.');

    // Click Save button
    await page.click('button:has-text("Save")');

    // Should exit edit mode and show formatted content
    await expect(textarea).not.toBeVisible();
    await expect(page.locator('text=Updated Content')).toBeVisible();
  });

  test('should edit note title', async ({ page }) => {
    // Select a note
    await page.locator('[data-testid="note-item"]').first().click();

    // Click edit button
    await page.click('[aria-label="Edit note"]');

    // Edit title
    const titleInput = page.locator('input[value]').first();
    await titleInput.fill('Modified Title');

    // Save
    await page.click('button:has-text("Save")');

    // Title should be updated in sidebar
    await expect(page.locator('text=Modified Title')).toBeVisible();
  });

  test('should toggle favorite/star on note', async ({ page }) => {
    // Select a note
    await page.locator('[data-testid="note-item"]').first().click();

    // Click star button
    await page.click('[aria-label*="favorite"]');

    // Star should be filled
    const starIcon = page.locator('[data-testid="star-icon"]');
    await expect(starIcon).toHaveClass(/fill-yellow/);

    // Click again to unstar
    await page.click('[aria-label*="favorite"]');

    // Star should be unfilled
    await expect(starIcon).not.toHaveClass(/fill-yellow/);
  });

  test('should delete a note with confirmation', async ({ page }) => {
    // Create a note to delete
    await page.click('button:has-text("New")');
    await page.fill('[placeholder*="Restaurant Recommendations"]', 'Test Delete Note');
    await page.click('button:has-text("Create Note")');

    // Wait for note to appear
    await expect(page.locator('text=Test Delete Note')).toBeVisible();

    // Click delete button
    await page.click('[aria-label="Delete note"]');

    // Confirmation dialog should appear
    await expect(page.locator('[role="alertdialog"]')).toBeVisible();
    await expect(page.locator('text=Delete Note?')).toBeVisible();

    // Confirm deletion
    await page.click('button:has-text("Delete")');

    // Note should be removed from sidebar
    await expect(page.locator('text=Test Delete Note')).not.toBeVisible();
  });

  test('should search/filter notes', async ({ page }) => {
    // Type in search box
    await page.fill('[placeholder*="Search notes"]', 'Packing');

    // Only matching notes should be visible
    await expect(page.locator('text=Packing List')).toBeVisible();
    await expect(page.locator('text=Food Research')).not.toBeVisible();

    // Clear search
    await page.fill('[placeholder*="Search notes"]', '');

    // All notes should be visible again
    await expect(page.locator('text=Food Research')).toBeVisible();
  });

  test('should show "No notes found" when search has no results', async ({ page }) => {
    // Search for non-existent note
    await page.fill('[placeholder*="Search notes"]', 'NonexistentNote123');

    // Should show empty state
    await expect(page.locator('text=No notes found')).toBeVisible();
  });

  test('should display last edited by information', async ({ page }) => {
    // Select a note
    await page.locator('[data-testid="note-item"]').first().click();

    // Should show last edited info
    const editInfo = page.locator('[data-testid="note-edit-info"]');
    await expect(editInfo).toBeVisible();

    // Should contain date
    const infoText = await editInfo.textContent();
    expect(infoText).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
  });

  test('should render Markdown formatting correctly', async ({ page }) => {
    // Select a note
    await page.locator('text=Packing List').click();

    // Should render headers
    await expect(page.locator('h1:has-text("Packing List")')).toBeVisible();
    await expect(page.locator('h2:has-text("Essentials")')).toBeVisible();

    // Should render lists
    const listItems = page.locator('li');
    const count = await listItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should cancel edit without saving changes', async ({ page }) => {
    // Select a note
    await page.locator('[data-testid="note-item"]').first().click();

    // Get original content
    const originalContent = await page.textContent('[data-testid="note-content"]');

    // Click edit
    await page.click('[aria-label="Edit note"]');

    // Make changes
    await page.fill('textarea', 'This should not be saved');

    // Click Cancel
    await page.click('button:has-text("Cancel")');

    // Content should be unchanged
    const currentContent = await page.textContent('[data-testid="note-content"]');
    expect(currentContent).toBe(originalContent);
  });

  test('should maintain note order in sidebar', async ({ page }) => {
    // Get initial note order
    const notes = page.locator('[data-testid="note-item"]');
    const firstNoteText = await notes.first().textContent();

    // Reload page
    await page.reload();
    await page.click('[data-tab="notes"]');

    // Note order should be preserved
    const reloadedFirstNote = await page.locator('[data-testid="note-item"]').first().textContent();
    expect(reloadedFirstNote).toBe(firstNoteText);
  });
});

test.describe('Notes Tab - Multi-User Collaboration', () => {
  let page1: Page;
  let page2: Page;

  test.beforeAll(async ({ browser }) => {
    // Simulate two users
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    page1 = await context1.newPage();
    page2 = await context2.newPage();
  });

  test('should show real-time updates when another user creates a note', async () => {
    // User 1 navigates to notes
    await page1.goto('/');
    await page1.click('[data-tab="notes"]');

    // User 2 navigates to notes
    await page2.goto('/');
    await page2.click('[data-tab="notes"]');

    // User 1 creates a new note
    await page1.click('button:has-text("New")');
    await page1.fill('[placeholder*="Restaurant Recommendations"]', 'Collaboration Test Note');
    await page1.click('button:has-text("Create Note")');

    // User 2 should see the new note appear (via Supabase real-time)
    await expect(page2.locator('text=Collaboration Test Note')).toBeVisible({ timeout: 5000 });
  });

  test('should show real-time updates when another user edits a note', async () => {
    // Both users select the same note
    await page1.locator('text=Packing List').click();
    await page2.locator('text=Packing List').click();

    // User 1 edits the note
    await page1.click('[aria-label="Edit note"]');
    await page1.fill('textarea', '# Real-time Test\\n\\nThis was edited by User 1');
    await page1.click('button:has-text("Save")');

    // User 2 should see the update
    await expect(page2.locator('text=Real-time Test')).toBeVisible({ timeout: 5000 });
    await expect(page2.locator('text=This was edited by User 1')).toBeVisible();
  });

  test('should show attribution when another user edits', async () => {
    // User 1 edits a note
    await page1.locator('[data-testid="note-item"]').first().click();
    await page1.click('[aria-label="Edit note"]');
    await page1.fill('textarea', 'Test attribution');
    await page1.click('button:has-text("Save")');

    // User 2 views the note
    await page2.locator('[data-testid="note-item"]').first().click();

    // Should show "Last edited by" info
    await expect(page2.locator('[data-testid="note-edit-info"]')).toBeVisible();
  });

  test('should handle concurrent edits gracefully', async () => {
    // Both users edit the same note simultaneously
    const noteName = 'Concurrent Edit Test';

    // User 1 creates note
    await page1.click('button:has-text("New")');
    await page1.fill('[placeholder*="Restaurant Recommendations"]', noteName);
    await page1.click('button:has-text("Create Note")');

    // Wait for User 2 to see it
    await expect(page2.locator(`text=${noteName}`)).toBeVisible({ timeout: 5000 });

    // Both click edit
    await page1.locator(`text=${noteName}`).click();
    await page1.click('[aria-label="Edit note"]');

    await page2.locator(`text=${noteName}`).click();
    await page2.click('[aria-label="Edit note"]');

    // Both make changes
    await page1.fill('textarea', 'User 1 content');
    await page2.fill('textarea', 'User 2 content');

    // User 1 saves first
    await page1.click('button:has-text("Save")');
    await page1.waitForTimeout(1000);

    // User 2 saves second (last write wins)
    await page2.click('button:has-text("Save")');
    await page2.waitForTimeout(1000);

    // Final content should be from User 2 (last write)
    await page1.reload();
    await page1.click('[data-tab="notes"]');
    await page1.locator(`text=${noteName}`).click();

    await expect(page1.locator('text=User 2 content')).toBeVisible();
  });
});
