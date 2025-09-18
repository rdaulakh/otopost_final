const { test, expect } = require('@playwright/test');

test.describe('AI Features E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should create and configure AI agent', async ({ page }) => {
    // Navigate to AI Agents page
    await page.click('text=AI Agents');
    await expect(page).toHaveURL(/.*ai-agents/);
    
    // Click create new agent button
    await page.click('text=Create New Agent');
    
    // Fill agent form
    await page.fill('input[name="name"]', 'E2E Test AI Agent');
    await page.fill('textarea[name="description"]', 'Test agent for E2E testing');
    await page.selectOption('select[name="agentType"]', 'content');
    
    // Configure AI settings
    await page.selectOption('select[name="model"]', 'gpt-4');
    await page.fill('input[name="temperature"]', '0.7');
    await page.fill('input[name="maxTokens"]', '2000');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for success message
    await expect(page.locator('text=Agent created successfully')).toBeVisible();
    
    // Verify agent appears in list
    await expect(page.locator('text=E2E Test AI Agent')).toBeVisible();
  });

  test('should execute AI agent task', async ({ page }) => {
    // Navigate to AI Agents page
    await page.click('text=AI Agents');
    
    // Click on first agent
    await page.click('.agent-card:first-child');
    
    // Click execute task button
    await page.click('text=Execute Task');
    
    // Fill task form
    await page.selectOption('select[name="taskType"]', 'content_generation');
    await page.fill('textarea[name="input"]', JSON.stringify({
      topic: 'AI in social media marketing',
      platform: 'twitter',
      tone: 'professional',
      length: 'short'
    }));
    
    // Submit task
    await page.click('button[type="submit"]');
    
    // Wait for task execution
    await expect(page.locator('text=Task submitted successfully')).toBeVisible();
    
    // Check task status
    await expect(page.locator('.task-status')).toBeVisible();
  });

  test('should analyze sentiment with AI tools', async ({ page }) => {
    // Navigate to AI Tools page
    await page.click('text=AI Tools');
    await expect(page).toHaveURL(/.*ai-tools/);
    
    // Click sentiment analyzer
    await page.click('text=Sentiment Analyzer');
    
    // Enter text for analysis
    await page.fill('textarea[name="text"]', 'I absolutely love this new AI feature! It\'s amazing and will help us grow our business significantly.');
    
    // Select context options
    await page.selectOption('select[name="platform"]', 'twitter');
    await page.check('input[name="includeEmotions"]');
    
    // Run analysis
    await page.click('button[type="submit"]');
    
    // Wait for results
    await expect(page.locator('.sentiment-results')).toBeVisible();
    
    // Verify sentiment score is displayed
    await expect(page.locator('.sentiment-score')).toBeVisible();
    
    // Verify emotions are detected
    await expect(page.locator('.emotions-detected')).toBeVisible();
  });

  test('should monitor competitors', async ({ page }) => {
    // Navigate to Competitor Monitoring page
    await page.click('text=Competitor Monitoring');
    await expect(page).toHaveURL(/.*competitor-monitoring/);
    
    // Add competitor handles
    await page.fill('input[name="competitors"]', '@competitor1, @competitor2, @competitor3');
    
    // Select platforms
    await page.check('input[name="platforms"][value="twitter"]');
    await page.check('input[name="platforms"][value="instagram"]');
    
    // Set monitoring period
    await page.selectOption('select[name="period"]', '7');
    
    // Start monitoring
    await page.click('button[type="submit"]');
    
    // Wait for monitoring to start
    await expect(page.locator('text=Monitoring started')).toBeVisible();
    
    // Verify competitor data is displayed
    await expect(page.locator('.competitor-data')).toBeVisible();
    
    // Check for insights
    await expect(page.locator('.competitor-insights')).toBeVisible();
  });

  test('should generate content with AI', async ({ page }) => {
    // Navigate to Content Creation page
    await page.click('text=Create Content');
    await expect(page).toHaveURL(/.*content/create/);
    
    // Enable AI assistance
    await page.check('input[name="useAI"]');
    
    // Fill content brief
    await page.fill('input[name="topic"]', 'Artificial Intelligence in Marketing');
    await page.selectOption('select[name="platform"]', 'linkedin');
    await page.selectOption('select[name="tone"]', 'professional');
    await page.selectOption('select[name="length"]', 'medium');
    
    // Add specific requirements
    await page.fill('textarea[name="requirements"]', 'Include statistics and call-to-action');
    
    // Generate content
    await page.click('text=Generate with AI');
    
    // Wait for AI generation
    await expect(page.locator('.ai-generating')).toBeVisible();
    await expect(page.locator('.ai-generating')).not.toBeVisible({ timeout: 30000 });
    
    // Verify generated content
    await expect(page.locator('.generated-content')).toBeVisible();
    
    // Check content quality
    const content = await page.textContent('.generated-content');
    expect(content.length).toBeGreaterThan(100);
    
    // Verify hashtags are generated
    await expect(page.locator('.generated-hashtags')).toBeVisible();
  });

  test('should schedule content with AI optimization', async ({ page }) => {
    // Navigate to Content Scheduling page
    await page.click('text=Schedule Content');
    await expect(page).toHaveURL(/.*content/schedule/);
    
    // Create new scheduled post
    await page.click('text=Schedule New Post');
    
    // Fill content
    await page.fill('textarea[name="content"]', 'Check out our latest AI-powered social media insights! #AI #Marketing #Innovation');
    
    // Select platforms
    await page.check('input[name="platforms"][value="twitter"]');
    await page.check('input[name="platforms"][value="linkedin"]');
    
    // Enable AI optimization
    await page.check('input[name="aiOptimization"]');
    
    // Set scheduling preferences
    await page.selectOption('select[name="schedulingMode"]', 'optimal');
    
    // Set date and time
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    await page.fill('input[name="scheduledDate"]', futureDate.toISOString().slice(0, 16));
    
    // Submit scheduling
    await page.click('button[type="submit"]');
    
    // Wait for AI optimization
    await expect(page.locator('.ai-optimizing')).toBeVisible();
    await expect(page.locator('.ai-optimizing')).not.toBeVisible({ timeout: 15000 });
    
    // Verify optimal times are suggested
    await expect(page.locator('.optimal-times')).toBeVisible();
    
    // Confirm scheduling
    await page.click('text=Confirm Schedule');
    
    // Wait for success
    await expect(page.locator('text=Content scheduled successfully')).toBeVisible();
  });

  test('should view AI analytics dashboard', async ({ page }) => {
    // Navigate to AI Analytics page
    await page.click('text=AI Analytics');
    await expect(page).toHaveURL(/.*ai-analytics/);
    
    // Check dashboard components
    await expect(page.locator('.ai-performance-metrics')).toBeVisible();
    await expect(page.locator('.agent-usage-stats')).toBeVisible();
    await expect(page.locator('.cost-analysis')).toBeVisible();
    
    // Check time period selector
    await page.selectOption('select[name="timePeriod"]', '30d');
    
    // Wait for data to update
    await expect(page.locator('.metrics-updated')).toBeVisible();
    
    // Check individual agent performance
    await page.click('.agent-performance-card:first-child');
    
    // Verify detailed metrics
    await expect(page.locator('.agent-details')).toBeVisible();
    await expect(page.locator('.task-success-rate')).toBeVisible();
    await expect(page.locator('.average-execution-time')).toBeVisible();
  });

  test('should manage AI agent configurations', async ({ page }) => {
    // Navigate to AI Agents page
    await page.click('text=AI Agents');
    
    // Click on first agent
    await page.click('.agent-card:first-child');
    
    // Click configuration tab
    await page.click('text=Configuration');
    
    // Update model settings
    await page.selectOption('select[name="model"]', 'gpt-4-turbo');
    await page.fill('input[name="temperature"]', '0.8');
    await page.fill('input[name="maxTokens"]', '4000');
    
    // Update system prompt
    await page.fill('textarea[name="systemPrompt"]', 'You are an expert social media content creator specializing in AI and technology topics.');
    
    // Save configuration
    await page.click('button[type="submit"]');
    
    // Wait for success
    await expect(page.locator('text=Configuration updated successfully')).toBeVisible();
    
    // Verify changes are saved
    await expect(page.locator('select[name="model"]')).toHaveValue('gpt-4-turbo');
    await expect(page.locator('input[name="temperature"]')).toHaveValue('0.8');
  });

  test('should test AI agent with different inputs', async ({ page }) => {
    // Navigate to AI Agents page
    await page.click('text=AI Agents');
    
    // Click on first agent
    await page.click('.agent-card:first-child');
    
    // Click test agent button
    await page.click('text=Test Agent');
    
    // Test with different inputs
    const testInputs = [
      'Create a tweet about AI in healthcare',
      'Write a LinkedIn post about digital transformation',
      'Generate Instagram caption for tech startup'
    ];
    
    for (const input of testInputs) {
      // Clear previous input
      await page.fill('textarea[name="testInput"]', '');
      
      // Enter new input
      await page.fill('textarea[name="testInput"]', input);
      
      // Run test
      await page.click('button[type="submit"]');
      
      // Wait for response
      await expect(page.locator('.test-response')).toBeVisible();
      
      // Verify response quality
      const response = await page.textContent('.test-response');
      expect(response.length).toBeGreaterThan(50);
    }
  });

  test('should handle AI agent errors gracefully', async ({ page }) => {
    // Navigate to AI Agents page
    await page.click('text=AI Agents');
    
    // Click on first agent
    await page.click('.agent-card:first-child');
    
    // Click execute task button
    await page.click('text=Execute Task');
    
    // Submit invalid task data
    await page.fill('textarea[name="input"]', 'invalid json data');
    
    // Submit task
    await page.click('button[type="submit"]');
    
    // Wait for error message
    await expect(page.locator('.error-message')).toBeVisible();
    
    // Verify error is user-friendly
    const errorText = await page.textContent('.error-message');
    expect(errorText).toContain('Invalid input format');
    
    // Check retry option is available
    await expect(page.locator('text=Try Again')).toBeVisible();
  });

  test('should export AI analytics data', async ({ page }) => {
    // Navigate to AI Analytics page
    await page.click('text=AI Analytics');
    
    // Select export options
    await page.check('input[name="exportMetrics"]');
    await page.check('input[name="exportCosts"]');
    await page.check('input[name="exportPerformance"]');
    
    // Select date range
    await page.fill('input[name="startDate"]', '2024-01-01');
    await page.fill('input[name="endDate"]', '2024-12-31');
    
    // Select export format
    await page.selectOption('select[name="format"]', 'csv');
    
    // Click export button
    await page.click('text=Export Data');
    
    // Wait for download to start
    await expect(page.locator('text=Export started')).toBeVisible();
    
    // Verify download completes
    const downloadPromise = page.waitForEvent('download');
    await page.click('text=Download File');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toContain('ai-analytics');
  });
});

