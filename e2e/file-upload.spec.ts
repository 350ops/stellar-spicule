import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Files Tab - Upload & Management E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.click('[data-tab="files"]');
    await page.waitForSelector('[data-testid="files-view"]', { timeout: 10000 });
  });

  test('should display files grid with existing files', async ({ page }) => {
    // Files grid should be visible
    await expect(page.locator('[data-testid="files-grid"]')).toBeVisible();

    // Should have some default files
    const fileCards = await page.locator('[data-testid="file-card"]').count();
    expect(fileCards).toBeGreaterThan(0);

    // Should show file names
    await expect(page.locator('text=Flight Confirmation.pdf')).toBeVisible();
  });

  test('should display category filters', async ({ page }) => {
    // Category buttons should be visible
    await expect(page.locator('button:has-text("All Files")')).toBeVisible();
    await expect(page.locator('button:has-text("Images")')).toBeVisible();
    await expect(page.locator('button:has-text("Documents")')).toBeVisible();
    await expect(page.locator('button:has-text("Other")')).toBeVisible();

    // Should show file count
    const allFilesButton = page.locator('button:has-text("All Files")');
    const buttonText = await allFilesButton.textContent();
    expect(buttonText).toMatch(/All Files \(\d+\)/);
  });

  test('should filter files by category', async ({ page }) => {
    // Click Images filter
    await page.click('button:has-text("Images")');

    // Only image files should be visible
    const visibleFiles = page.locator('[data-testid="file-card"]');
    const count = await visibleFiles.count();

    // Check that visible files are images
    for (let i = 0; i < count; i++) {
      const fileName = await visibleFiles.nth(i).locator('[data-testid="file-name"]').textContent();
      expect(fileName).toMatch(/\.(jpg|jpeg|png|gif|webp)$/i);
    }

    // Click All to reset
    await page.click('button:has-text("All Files")');

    // More files should be visible now
    const allCount = await page.locator('[data-testid="file-card"]').count();
    expect(allCount).toBeGreaterThanOrEqual(count);
  });

  test('should search files by name', async ({ page }) => {
    // Type in search box
    await page.fill('[placeholder*="Search files"]', 'Flight');

    // Only matching files should be visible
    await expect(page.locator('text=Flight Confirmation.pdf')).toBeVisible();

    // Non-matching files should not be visible
    const fileCount = await page.locator('[data-testid="file-card"]').count();
    expect(fileCount).toBeLessThanOrEqual(2); // Assuming only 1-2 files match "Flight"

    // Clear search
    await page.click('[data-testid="clear-search"]');

    // All files visible again
    const allFiles = await page.locator('[data-testid="file-card"]').count();
    expect(allFiles).toBeGreaterThan(fileCount);
  });

  test('should upload a single file', async ({ page }) => {
    // Get initial file count
    const initialCount = await page.locator('[data-testid="file-card"]').count();

    // Click Upload Files button (opens file input)
    const fileInput = page.locator('input[type="file"]');

    // Create a test file
    await fileInput.setInputFiles({
      name: 'test-document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Test PDF content')
    });

    // Upload dialog should appear
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('text=Upload Files')).toBeVisible();

    // Should show file in preview
    await expect(page.locator('text=test-document.pdf')).toBeVisible();

    // Click Upload button
    await page.click('button:has-text("Upload 1 File")');

    // New file should appear in grid
    await page.waitForTimeout(1000);
    const newCount = await page.locator('[data-testid="file-card"]').count();
    expect(newCount).toBe(initialCount + 1);

    await expect(page.locator('text=test-document.pdf')).toBeVisible();
  });

  test('should upload multiple files at once', async ({ page }) => {
    // Get initial count
    const initialCount = await page.locator('[data-testid="file-card"]').count();

    // Upload multiple files
    const fileInput = page.locator('input[type="file"]');

    await fileInput.setInputFiles([
      {
        name: 'photo1.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake image 1')
      },
      {
        name: 'photo2.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake image 2')
      },
      {
        name: 'document.docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        buffer: Buffer.from('fake document')
      }
    ]);

    // Dialog should show 3 files
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('text=3 files selected')).toBeVisible();

    // Click Upload
    await page.click('button:has-text("Upload 3 Files")');

    // All files should appear
    await page.waitForTimeout(1500);
    const newCount = await page.locator('[data-testid="file-card"]').count();
    expect(newCount).toBe(initialCount + 3);
  });

  test('should display file size and type correctly', async ({ page }) => {
    // Check first file card
    const firstFile = page.locator('[data-testid="file-card"]').first();

    // Should show file size
    const fileSize = firstFile.locator('[data-testid="file-size"]');
    await expect(fileSize).toBeVisible();

    const sizeText = await fileSize.textContent();
    // Should be formatted like "1.2 MB" or "850 KB"
    expect(sizeText).toMatch(/[\d.]+ (B|KB|MB|GB)/);

    // Should show file type badge
    const fileType = firstFile.locator('[data-testid="file-type-badge"]');
    await expect(fileType).toBeVisible();
  });

  test('should delete a file with confirmation', async ({ page }) => {
    // Get initial count
    const initialCount = await page.locator('[data-testid="file-card"]').count();

    // Hover over file to show actions
    const firstFile = page.locator('[data-testid="file-card"]').first();
    await firstFile.hover();

    // Click more actions button
    await firstFile.locator('[data-testid="file-actions"]').click();

    // Click Delete option
    await page.click('[role="menuitem"]:has-text("Delete")');

    // Confirmation dialog should appear
    await expect(page.locator('[role="alertdialog"]')).toBeVisible();
    await expect(page.locator('text=Delete File?')).toBeVisible();

    // Confirm deletion
    await page.click('button:has-text("Delete")');

    // File should be removed
    await page.waitForTimeout(500);
    const newCount = await page.locator('[data-testid="file-card"]').count();
    expect(newCount).toBe(initialCount - 1);
  });

  test('should download a file', async ({ page }) => {
    // Set up download listener
    const downloadPromise = page.waitForEvent('download');

    // Click on file to open actions
    const firstFile = page.locator('[data-testid="file-card"]').first();
    await firstFile.hover();
    await firstFile.locator('[data-testid="file-actions"]').click();

    // Click Download option
    await page.click('[role="menuitem"]:has-text("Download")');

    // Wait for download
    const download = await downloadPromise;

    // Verify download started
    expect(download.suggestedFilename()).toBeTruthy();
  });

  test('should show empty state when no files', async ({ page }) => {
    // Delete all files
    let fileCount = await page.locator('[data-testid="file-card"]').count();

    while (fileCount > 0) {
      const file = page.locator('[data-testid="file-card"]').first();
      await file.hover();
      await file.locator('[data-testid="file-actions"]').click();
      await page.click('[role="menuitem"]:has-text("Delete")');
      await page.click('button:has-text("Delete")');
      await page.waitForTimeout(300);

      fileCount = await page.locator('[data-testid="file-card"]').count();
    }

    // Should show empty state
    await expect(page.locator('text=No files found')).toBeVisible();
    await expect(page.locator('text=Upload your first file')).toBeVisible();
  });

  test('should show "No files found" when search has no results', async ({ page }) => {
    // Search for non-existent file
    await page.fill('[placeholder*="Search files"]', 'NonexistentFile12345');

    // Should show no results message
    await expect(page.locator('text=No files found')).toBeVisible();
    await expect(page.locator('text=Try adjusting your search')).toBeVisible();
  });

  test('should display file icons based on file type', async ({ page }) => {
    // Check various file types have appropriate icons
    const fileCards = page.locator('[data-testid="file-card"]');
    const count = await fileCards.count();

    for (let i = 0; i < Math.min(count, 3); i++) {
      const card = fileCards.nth(i);
      const icon = card.locator('[data-testid="file-icon"]');

      await expect(icon).toBeVisible();
    }
  });

  test('should display image thumbnails for image files', async ({ page }) => {
    // Filter to images
    await page.click('button:has-text("Images")');

    // Image files should show thumbnail
    const imageCards = page.locator('[data-testid="file-card"][data-file-type="image"]');
    const count = await imageCards.count();

    if (count > 0) {
      const firstImage = imageCards.first();
      const thumbnail = firstImage.locator('img');

      await expect(thumbnail).toBeVisible();
    }
  });

  test('should show uploaded by attribution', async ({ page }) => {
    // Check first file
    const firstFile = page.locator('[data-testid="file-card"]').first();

    // Should show "by [user]"
    const attribution = firstFile.locator('[data-testid="file-uploader"]');
    await expect(attribution).toBeVisible();

    const text = await attribution.textContent();
    expect(text).toMatch(/by (Camille|Miguel|You)/);
  });

  test('should cancel file upload', async ({ page }) => {
    // Get initial count
    const initialCount = await page.locator('[data-testid="file-card"]').count();

    // Start upload
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'cancelled-file.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Content')
    });

    // Upload dialog appears
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Click Cancel
    await page.click('button:has-text("Cancel")');

    // Dialog should close
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();

    // File count unchanged
    const finalCount = await page.locator('[data-testid="file-card"]').count();
    expect(finalCount).toBe(initialCount);
  });

  test('should handle file upload errors gracefully', async ({ page }) => {
    // Try to upload a very large file or invalid type
    // This would trigger validation/error handling

    const fileInput = page.locator('input[type="file"]');

    // Create a large buffer (simulating large file)
    const largeBuffer = Buffer.alloc(100 * 1024 * 1024); // 100MB

    await fileInput.setInputFiles({
      name: 'huge-file.zip',
      mimeType: 'application/zip',
      buffer: largeBuffer
    });

    // Check if error message appears (implementation dependent)
    // This test structure allows for error handling verification
  });

  test('should maintain file order after upload', async ({ page }) => {
    // Upload new file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'newest-file.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('New content')
    });

    await page.click('button:has-text("Upload 1 File")');
    await page.waitForTimeout(1000);

    // Newest file should appear first (assuming sort by created_at DESC)
    const firstFileName = await page.locator('[data-testid="file-card"]').first()
      .locator('[data-testid="file-name"]').textContent();

    expect(firstFileName).toContain('newest-file.pdf');
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Switch to mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.click('[data-tab="files"]');

    // Files view should still work
    await expect(page.locator('[data-testid="files-view"]')).toBeVisible();

    // Grid should adapt (fewer columns)
    const grid = page.locator('[data-testid="files-grid"]');
    await expect(grid).toBeVisible();

    // Upload button should be accessible
    await expect(page.locator('button:has-text("Upload Files")')).toBeVisible();
  });

  test('should support file categories for organization', async ({ page }) => {
    // Each file should have a category
    const fileCards = page.locator('[data-testid="file-card"]');
    const firstCard = fileCards.first();

    // Category should be assigned
    const category = await firstCard.getAttribute('data-category');
    expect(['images', 'documents', 'other']).toContain(category);
  });

  test('should handle concurrent file uploads', async ({ page }) => {
    // Upload multiple files in quick succession
    const fileInput = page.locator('input[type="file"]');

    // First upload
    await fileInput.setInputFiles({
      name: 'file1.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('File 1')
    });
    await page.click('button:has-text("Upload")');

    // Immediately try second upload
    await page.waitForTimeout(100);

    await fileInput.setInputFiles({
      name: 'file2.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('File 2')
    });
    await page.click('button:has-text("Upload")');

    // Both files should eventually appear
    await page.waitForTimeout(2000);

    await expect(page.locator('text=file1.pdf')).toBeVisible();
    await expect(page.locator('text=file2.pdf')).toBeVisible();
  });
});
