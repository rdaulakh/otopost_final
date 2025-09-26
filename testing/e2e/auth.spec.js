const { test, expect } = require('@playwright/test');

test.describe('Authentication E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000');
  });

  test('should register a new user successfully', async ({ page }) => {
    // Click on register link
    await page.click('text=Sign Up');
    
    // Fill registration form
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!');
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for success message
    await expect(page.locator('text=Registration successful')).toBeVisible();
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should login existing user successfully', async ({ page }) => {
    // Click on login link
    await page.click('text=Sign In');
    
    // Fill login form
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Verify user is logged in
    await expect(page.locator('text=Welcome back, Test!')).toBeVisible();
  });

  test('should show error for invalid login credentials', async ({ page }) => {
    // Click on login link
    await page.click('text=Sign In');
    
    // Fill login form with invalid credentials
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'WrongPassword123!');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('should show validation errors for invalid registration data', async ({ page }) => {
    // Click on register link
    await page.click('text=Sign Up');
    
    // Fill registration form with invalid data
    await page.fill('input[name="username"]', 'ab'); // Too short
    await page.fill('input[name="email"]', 'invalid-email'); // Invalid email
    await page.fill('input[name="password"]', 'weak'); // Weak password
    await page.fill('input[name="confirmPassword"]', 'different'); // Mismatched passwords
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for validation errors
    await expect(page.locator('text=Username must be at least 3 characters')).toBeVisible();
    await expect(page.locator('text=Please provide a valid email address')).toBeVisible();
    await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible();
    await expect(page.locator('text=Passwords do not match')).toBeVisible();
  });

  test('should logout user successfully', async ({ page }) => {
    // Login first
    await page.click('text=Sign In');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Click logout button
    await page.click('button[data-testid="logout-button"]');
    
    // Confirm logout
    await page.click('button[data-testid="confirm-logout"]');
    
    // Verify redirect to login page
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('text=Sign In')).toBeVisible();
  });

  test('should handle forgot password flow', async ({ page }) => {
    // Click on login link
    await page.click('text=Sign In');
    
    // Click forgot password link
    await page.click('text=Forgot Password?');
    
    // Fill email
    await page.fill('input[name="email"]', 'test@example.com');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for success message
    await expect(page.locator('text=Password reset email sent')).toBeVisible();
  });

  test('should handle password reset with valid token', async ({ page }) => {
    // Navigate to reset password page with token
    await page.goto('http://localhost:3000/reset-password?token=valid-reset-token');
    
    // Fill new password
    await page.fill('input[name="newPassword"]', 'NewPassword123!');
    await page.fill('input[name="confirmNewPassword"]', 'NewPassword123!');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for success message
    await expect(page.locator('text=Password reset successful')).toBeVisible();
    
    // Verify redirect to login
    await expect(page).toHaveURL(/.*login/);
  });

  test('should show error for invalid reset token', async ({ page }) => {
    // Navigate to reset password page with invalid token
    await page.goto('http://localhost:3000/reset-password?token=invalid-token');
    
    // Fill new password
    await page.fill('input[name="newPassword"]', 'NewPassword123!');
    await page.fill('input[name="confirmNewPassword"]', 'NewPassword123!');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for error message
    await expect(page.locator('text=Invalid or expired reset token')).toBeVisible();
  });

  test('should maintain session across page refreshes', async ({ page }) => {
    // Login first
    await page.click('text=Sign In');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Refresh page
    await page.reload();
    
    // Verify user is still logged in
    await expect(page.locator('text=Welcome back, Test!')).toBeVisible();
  });

  test('should redirect to login when accessing protected route without authentication', async ({ page }) => {
    // Try to access dashboard without logging in
    await page.goto('http://localhost:3000/dashboard');
    
    // Verify redirect to login
    await expect(page).toHaveURL(/.*login/);
  });

  test('should show loading states during authentication', async ({ page }) => {
    // Click on login link
    await page.click('text=Sign In');
    
    // Fill login form
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Check for loading state
    await expect(page.locator('text=Signing in...')).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/auth/login', route => route.abort());
    
    // Click on login link
    await page.click('text=Sign In');
    
    // Fill login form
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for error message
    await expect(page.locator('text=Network error. Please try again.')).toBeVisible();
  });

  test('should validate form fields in real-time', async ({ page }) => {
    // Click on register link
    await page.click('text=Sign Up');
    
    // Test email validation
    await page.fill('input[name="email"]', 'invalid-email');
    await page.blur('input[name="email"]');
    await expect(page.locator('text=Please provide a valid email address')).toBeVisible();
    
    // Test password strength
    await page.fill('input[name="password"]', 'weak');
    await page.blur('input[name="password"]');
    await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible();
    
    // Test password confirmation
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'DifferentPassword123!');
    await page.blur('input[name="confirmPassword"]');
    await expect(page.locator('text=Passwords do not match')).toBeVisible();
  });

  test('should handle concurrent login attempts', async ({ page, context }) => {
    // Open multiple tabs
    const page2 = await context.newPage();
    
    // Login in first tab
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    
    // Login in second tab
    await page2.goto('http://localhost:3000/login');
    await page2.fill('input[name="email"]', 'test@example.com');
    await page2.fill('input[name="password"]', 'TestPassword123!');
    await page2.click('button[type="submit"]');
    
    // Both should succeed
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page2).toHaveURL(/.*dashboard/);
    
    await page2.close();
  });

  test('should remember user choice for "Remember Me"', async ({ page }) => {
    // Click on login link
    await page.click('text=Sign In');
    
    // Fill login form
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    
    // Check "Remember Me" checkbox
    await page.check('input[name="rememberMe"]');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Close browser and reopen
    await page.close();
    const newPage = await page.context().newPage();
    await newPage.goto('http://localhost:3000');
    
    // User should still be logged in
    await expect(newPage).toHaveURL(/.*dashboard/);
  });
});

