const { test, expect } = require('@playwright/test');

test.describe('Content Management E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should create new content successfully', async ({ page }) => {
    // Navigate to create content page
    await page.click('text=Create New Post');
    
    // Fill content form
    await page.fill('input[name="title"]', 'E2E Test Post');
    await page.fill('textarea[name="content"]', 'This is a test post created during E2E testing');
    
    // Select content type
    await page.selectOption('select[name="type"]', 'text');
    
    // Select platforms
    await page.check('input[name="platforms"][value="facebook"]');
    await page.check('input[name="platforms"][value="twitter"]');
    
    // Add hashtags
    await page.fill('input[name="hashtags"]', '#e2e #testing #automation');
    
    // Set scheduled date
    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 2);
    await page.fill('input[name="scheduledDate"]', futureDate.toISOString().slice(0, 16));
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for success message
    await expect(page.locator('text=Content created successfully')).toBeVisible();
    
    // Verify redirect to content list
    await expect(page).toHaveURL(/.*content/);
    
    // Verify content appears in list
    await expect(page.locator('text=E2E Test Post')).toBeVisible();
  });

  test('should edit existing content', async ({ page }) => {
    // Navigate to content list
    await page.click('text=Content');
    
    // Click on first content item
    await page.click('[data-testid="content-item"]:first-child');
    
    // Click edit button
    await page.click('button[data-testid="edit-button"]');
    
    // Update content
    await page.fill('input[name="title"]', 'Updated E2E Test Post');
    await page.fill('textarea[name="content"]', 'This is an updated test post');
    
    // Save changes
    await page.click('button[type="submit"]');
    
    // Wait for success message
    await expect(page.locator('text=Content updated successfully')).toBeVisible();
    
    // Verify changes are reflected
    await expect(page.locator('text=Updated E2E Test Post')).toBeVisible();
  });

  test('should schedule content for future publishing', async ({ page }) => {
    // Navigate to content list
    await page.click('text=Content');
    
    // Click on first content item
    await page.click('[data-testid="content-item"]:first-child');
    
    // Click schedule button
    await page.click('button[data-testid="schedule-button"]');
    
    // Set future date and time
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    futureDate.setHours(14, 0, 0, 0);
    
    await page.fill('input[name="scheduledDate"]', futureDate.toISOString().slice(0, 16));
    
    // Select platforms
    await page.check('input[name="platforms"][value="facebook"]');
    await page.check('input[name="platforms"][value="instagram"]');
    
    // Submit schedule
    await page.click('button[type="submit"]');
    
    // Wait for success message
    await expect(page.locator('text=Content scheduled successfully')).toBeVisible();
    
    // Verify status changed to scheduled
    await expect(page.locator('text=Scheduled')).toBeVisible();
  });

  test('should publish content immediately', async ({ page }) => {
    // Navigate to content list
    await page.click('text=Content');
    
    // Click on first content item
    await page.click('[data-testid="content-item"]:first-child');
    
    // Click publish button
    await page.click('button[data-testid="publish-button"]');
    
    // Confirm publication
    await page.click('button[data-testid="confirm-publish"]');
    
    // Wait for success message
    await expect(page.locator('text=Content published successfully')).toBeVisible();
    
    // Verify status changed to published
    await expect(page.locator('text=Published')).toBeVisible();
  });

  test('should delete content with confirmation', async ({ page }) => {
    // Navigate to content list
    await page.click('text=Content');
    
    // Click on first content item
    await page.click('[data-testid="content-item"]:first-child');
    
    // Click delete button
    await page.click('button[data-testid="delete-button"]');
    
    // Confirm deletion
    await page.click('button[data-testid="confirm-delete"]');
    
    // Wait for success message
    await expect(page.locator('text=Content deleted successfully')).toBeVisible();
    
    // Verify content is removed from list
    await expect(page.locator('[data-testid="content-item"]:first-child')).not.toBeVisible();
  });

  test('should filter content by status', async ({ page }) => {
    // Navigate to content list
    await page.click('text=Content');
    
    // Filter by published content
    await page.selectOption('select[name="status"]', 'published');
    
    // Wait for content to load
    await page.waitForSelector('[data-testid="content-item"]');
    
    // Verify only published content is shown
    const statusBadges = await page.locator('[data-testid="status-badge"]').all();
    for (const badge of statusBadges) {
      await expect(badge).toHaveText('Published');
    }
  });

  test('should filter content by platform', async ({ page }) => {
    // Navigate to content list
    await page.click('text=Content');
    
    // Filter by Facebook content
    await page.selectOption('select[name="platform"]', 'facebook');
    
    // Wait for content to load
    await page.waitForSelector('[data-testid="content-item"]');
    
    // Verify only Facebook content is shown
    const platformIcons = await page.locator('[data-testid="facebook-icon"]').all();
    expect(platformIcons.length).toBeGreaterThan(0);
  });

  test('should search content by title', async ({ page }) => {
    // Navigate to content list
    await page.click('text=Content');
    
    // Search for specific content
    await page.fill('input[name="search"]', 'Test Post');
    
    // Wait for search results
    await page.waitForSelector('[data-testid="content-item"]');
    
    // Verify search results contain the search term
    const contentItems = await page.locator('[data-testid="content-item"]').all();
    for (const item of contentItems) {
      const title = await item.locator('[data-testid="content-title"]').textContent();
      expect(title.toLowerCase()).toContain('test post');
    }
  });

  test('should sort content by date', async ({ page }) => {
    // Navigate to content list
    await page.click('text=Content');
    
    // Sort by newest first
    await page.selectOption('select[name="sortBy"]', 'createdAt');
    await page.selectOption('select[name="sortOrder"]', 'desc');
    
    // Wait for content to load
    await page.waitForSelector('[data-testid="content-item"]');
    
    // Verify content is sorted by date (newest first)
    const dates = await page.locator('[data-testid="content-date"]').allTextContents();
    const sortedDates = [...dates].sort((a, b) => new Date(b) - new Date(a));
    expect(dates).toEqual(sortedDates);
  });

  test('should handle content with media attachments', async ({ page }) => {
    // Navigate to create content page
    await page.click('text=Create New Post');
    
    // Fill basic content
    await page.fill('input[name="title"]', 'Media Test Post');
    await page.fill('textarea[name="content"]', 'This post includes media attachments');
    
    // Select content type
    await page.selectOption('select[name="type"]', 'image');
    
    // Upload image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('test-files/sample-image.jpg');
    
    // Wait for upload to complete
    await expect(page.locator('text=Upload completed')).toBeVisible();
    
    // Select platforms
    await page.check('input[name="platforms"][value="instagram"]');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for success message
    await expect(page.locator('text=Content created successfully')).toBeVisible();
  });

  test('should handle content validation errors', async ({ page }) => {
    // Navigate to create content page
    await page.click('text=Create New Post');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Verify validation errors
    await expect(page.locator('text=Title is required')).toBeVisible();
    await expect(page.locator('text=Content is required')).toBeVisible();
    await expect(page.locator('text=At least one platform must be selected')).toBeVisible();
  });

  test('should handle content with hashtags and mentions', async ({ page }) => {
    // Navigate to create content page
    await page.click('text=Create New Post');
    
    // Fill content with hashtags and mentions
    await page.fill('input[name="title"]', 'Hashtag Test Post');
    await page.fill('textarea[name="content"]', 'This post includes @testuser and #hashtags');
    
    // Select content type
    await page.selectOption('select[name="type"]', 'text');
    
    // Add additional hashtags
    await page.fill('input[name="hashtags"]', '#socialmedia #marketing #test');
    
    // Add mentions
    await page.fill('input[name="mentions"]', '@user1 @user2');
    
    // Select platforms
    await page.check('input[name="platforms"][value="twitter"]');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for success message
    await expect(page.locator('text=Content created successfully')).toBeVisible();
  });

  test('should handle content scheduling conflicts', async ({ page }) => {
    // Navigate to content list
    await page.click('text=Content');
    
    // Click on first content item
    await page.click('[data-testid="content-item"]:first-child');
    
    // Click schedule button
    await page.click('button[data-testid="schedule-button"]');
    
    // Set conflicting date (same time as existing scheduled content)
    const conflictDate = new Date();
    conflictDate.setHours(14, 0, 0, 0);
    
    await page.fill('input[name="scheduledDate"]', conflictDate.toISOString().slice(0, 16));
    
    // Select same platform
    await page.check('input[name="platforms"][value="facebook"]');
    
    // Submit schedule
    await page.click('button[type="submit"]');
    
    // Wait for conflict warning
    await expect(page.locator('text=Scheduling conflict detected')).toBeVisible();
    
    // Verify conflict resolution options
    await expect(page.locator('text=Reschedule to next available time')).toBeVisible();
    await expect(page.locator('text=Override existing schedule')).toBeVisible();
  });

  test('should handle bulk content operations', async ({ page }) => {
    // Navigate to content list
    await page.click('text=Content');
    
    // Select multiple content items
    await page.check('[data-testid="content-checkbox"]:first-child');
    await page.check('[data-testid="content-checkbox"]:nth-child(2)');
    
    // Click bulk actions
    await page.click('button[data-testid="bulk-actions"]');
    
    // Select bulk schedule
    await page.click('text=Bulk Schedule');
    
    // Set schedule date
    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 3);
    await page.fill('input[name="scheduledDate"]', futureDate.toISOString().slice(0, 16));
    
    // Submit bulk schedule
    await page.click('button[type="submit"]');
    
    // Wait for success message
    await expect(page.locator('text=2 content items scheduled successfully')).toBeVisible();
  });

  test('should handle content analytics integration', async ({ page }) => {
    // Navigate to content list
    await page.click('text=Content');
    
    // Click on first content item
    await page.click('[data-testid="content-item"]:first-child');
    
    // Click analytics button
    await page.click('button[data-testid="analytics-button"]');
    
    // Wait for analytics modal
    await expect(page.locator('[data-testid="analytics-modal"]')).toBeVisible();
    
    // Verify analytics data is displayed
    await expect(page.locator('text=Engagement Rate')).toBeVisible();
    await expect(page.locator('text=Reach')).toBeVisible();
    await expect(page.locator('text=Impressions')).toBeVisible();
    
    // Close modal
    await page.click('button[data-testid="close-modal"]');
  });

  test('should handle content with different visibility settings', async ({ page }) => {
    // Navigate to create content page
    await page.click('text=Create New Post');
    
    // Fill basic content
    await page.fill('input[name="title"]', 'Visibility Test Post');
    await page.fill('textarea[name="content"]', 'This post has custom visibility settings');
    
    // Select content type
    await page.selectOption('select[name="type"]', 'text');
    
    // Set visibility to followers only
    await page.selectOption('select[name="visibility"]', 'followers');
    
    // Select platforms
    await page.check('input[name="platforms"][value="facebook"]');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for success message
    await expect(page.locator('text=Content created successfully')).toBeVisible();
    
    // Verify visibility setting is saved
    await page.click('[data-testid="content-item"]:first-child');
    await expect(page.locator('text=Followers Only')).toBeVisible();
  });
});

