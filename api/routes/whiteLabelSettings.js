const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

// Rate limiting middleware
const whiteLabelLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many white label requests from this IP'
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Admin role verification
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Apply middleware to all routes
router.use(whiteLabelLimit);
router.use(authenticateToken);
router.use(requireAdmin);

// ============================================================================
// WHITE LABEL INSTANCES
// ============================================================================

// Get all white label instances
router.get('/instances', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, plan } = req.query;
    
    // Generate realistic white label instances
    const statuses = ['active', 'inactive', 'pending', 'suspended'];
    const plans = ['starter', 'professional', 'enterprise', 'custom'];
    const companies = ['TechCorp Solutions', 'Digital Marketing Pro', 'Social Media Hub', 'Brand Boost Agency', 'Creative Studios Inc'];
    
    const instances = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `${companies[Math.floor(Math.random() * companies.length)]} ${i + 1}`,
      domain: `client${i + 1}.yourdomain.com`,
      custom_domain: Math.random() > 0.5 ? `${companies[i % companies.length].toLowerCase().replace(/\s+/g, '')}.com` : null,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      plan: plans[Math.floor(Math.random() * plans.length)],
      created: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      last_active: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      users_count: Math.floor(Math.random() * 1000) + 10,
      monthly_revenue: Math.floor(Math.random() * 5000) + 100,
      storage_used: Math.floor(Math.random() * 50) + 5, // GB
      bandwidth_used: Math.floor(Math.random() * 100) + 10, // GB
      branding: {
        logo: `https://via.placeholder.com/200x80?text=Logo${i + 1}`,
        primary_color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
        secondary_color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
        custom_css: Math.random() > 0.7
      }
    }));

    // Apply filters
    let filteredInstances = instances;
    if (status) {
      filteredInstances = filteredInstances.filter(instance => instance.status === status);
    }
    if (plan) {
      filteredInstances = filteredInstances.filter(instance => instance.plan === plan);
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedInstances = filteredInstances.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedInstances,
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total: filteredInstances.length,
        total_pages: Math.ceil(filteredInstances.length / limit)
      },
      summary: {
        total_instances: instances.length,
        active: instances.filter(i => i.status === 'active').length,
        inactive: instances.filter(i => i.status === 'inactive').length,
        pending: instances.filter(i => i.status === 'pending').length,
        suspended: instances.filter(i => i.status === 'suspended').length,
        total_revenue: instances.reduce((sum, i) => sum + i.monthly_revenue, 0)
      }
    });
  } catch (error) {
    console.error('Error fetching white label instances:', error);
    res.status(500).json({ error: 'Failed to fetch white label instances' });
  }
});

// Create new white label instance
router.post('/instances', async (req, res) => {
  try {
    const { name, domain, plan, branding } = req.body;
    
    if (!name || !domain || !plan) {
      return res.status(400).json({ error: 'Name, domain, and plan are required' });
    }

    const newInstance = {
      id: Date.now(),
      name,
      domain,
      custom_domain: null,
      status: 'pending',
      plan,
      created: new Date().toISOString(),
      last_active: null,
      users_count: 0,
      monthly_revenue: 0,
      storage_used: 0,
      bandwidth_used: 0,
      branding: branding || {
        logo: 'https://via.placeholder.com/200x80?text=NewLogo',
        primary_color: '#3b82f6',
        secondary_color: '#1e40af',
        custom_css: false
      }
    };

    res.status(201).json({
      success: true,
      data: newInstance,
      message: 'White label instance created successfully'
    });
  } catch (error) {
    console.error('Error creating white label instance:', error);
    res.status(500).json({ error: 'Failed to create white label instance' });
  }
});

// Update white label instance
router.put('/instances/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // In production, update in database
    const updatedInstance = {
      id: parseInt(id),
      ...updates,
      updated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: updatedInstance,
      message: 'White label instance updated successfully'
    });
  } catch (error) {
    console.error('Error updating white label instance:', error);
    res.status(500).json({ error: 'Failed to update white label instance' });
  }
});

// Delete white label instance
router.delete('/instances/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // In production, delete from database
    res.json({
      success: true,
      message: `White label instance ${id} deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting white label instance:', error);
    res.status(500).json({ error: 'Failed to delete white label instance' });
  }
});

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

// Get all email templates
router.get('/email-templates', async (req, res) => {
  try {
    const { category, status } = req.query;
    
    // Generate realistic email templates
    const categories = ['welcome', 'notification', 'marketing', 'transactional', 'system'];
    const statuses = ['active', 'draft', 'archived'];
    
    const emailTemplates = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      name: `${categories[i % categories.length].charAt(0).toUpperCase() + categories[i % categories.length].slice(1)} Template ${i + 1}`,
      category: categories[i % categories.length],
      subject: `Sample ${categories[i % categories.length]} email subject`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      created: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
      updated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      usage_count: Math.floor(Math.random() * 1000),
      open_rate: Math.floor(Math.random() * 40) + 60, // 60-100%
      click_rate: Math.floor(Math.random() * 20) + 10, // 10-30%
      variables: ['{{user_name}}', '{{company_name}}', '{{date}}', '{{custom_message}}'],
      html_content: `<html><body><h1>Sample ${categories[i % categories.length]} Template</h1><p>This is a sample email template for {{user_name}} from {{company_name}}.</p></body></html>`,
      text_content: `Sample ${categories[i % categories.length]} Template\n\nThis is a sample email template for {{user_name}} from {{company_name}}.`
    }));

    // Apply filters
    let filteredTemplates = emailTemplates;
    if (category) {
      filteredTemplates = filteredTemplates.filter(template => template.category === category);
    }
    if (status) {
      filteredTemplates = filteredTemplates.filter(template => template.status === status);
    }

    res.json({
      success: true,
      data: filteredTemplates,
      total: filteredTemplates.length,
      summary: {
        by_category: categories.map(cat => ({
          category: cat,
          count: emailTemplates.filter(t => t.category === cat).length
        })),
        by_status: statuses.map(stat => ({
          status: stat,
          count: emailTemplates.filter(t => t.status === stat).length
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching email templates:', error);
    res.status(500).json({ error: 'Failed to fetch email templates' });
  }
});

// Create new email template
router.post('/email-templates', async (req, res) => {
  try {
    const { name, category, subject, html_content, text_content, variables } = req.body;
    
    if (!name || !category || !subject) {
      return res.status(400).json({ error: 'Name, category, and subject are required' });
    }

    const newTemplate = {
      id: Date.now(),
      name,
      category,
      subject,
      status: 'draft',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      usage_count: 0,
      open_rate: 0,
      click_rate: 0,
      variables: variables || [],
      html_content: html_content || '',
      text_content: text_content || ''
    };

    res.status(201).json({
      success: true,
      data: newTemplate,
      message: 'Email template created successfully'
    });
  } catch (error) {
    console.error('Error creating email template:', error);
    res.status(500).json({ error: 'Failed to create email template' });
  }
});

// Update email template
router.put('/email-templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // In production, update in database
    const updatedTemplate = {
      id: parseInt(id),
      ...updates,
      updated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: updatedTemplate,
      message: 'Email template updated successfully'
    });
  } catch (error) {
    console.error('Error updating email template:', error);
    res.status(500).json({ error: 'Failed to update email template' });
  }
});

// Delete email template
router.delete('/email-templates/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // In production, delete from database
    res.json({
      success: true,
      message: `Email template ${id} deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting email template:', error);
    res.status(500).json({ error: 'Failed to delete email template' });
  }
});

// ============================================================================
// BRANDING SETTINGS
// ============================================================================

// Get branding settings for an instance
router.get('/instances/:id/branding', async (req, res) => {
  try {
    const { id } = req.params;
    
    const brandingSettings = {
      instance_id: parseInt(id),
      logo: 'https://via.placeholder.com/200x80?text=Logo',
      favicon: 'https://via.placeholder.com/32x32?text=F',
      primary_color: '#3b82f6',
      secondary_color: '#1e40af',
      accent_color: '#f59e0b',
      background_color: '#ffffff',
      text_color: '#1f2937',
      font_family: 'Inter, sans-serif',
      custom_css: '.custom-style { color: #3b82f6; }',
      footer_text: 'Powered by Your White Label Platform',
      show_powered_by: true,
      custom_domain: `client${id}.yourdomain.com`,
      ssl_enabled: true
    };

    res.json({
      success: true,
      data: brandingSettings
    });
  } catch (error) {
    console.error('Error fetching branding settings:', error);
    res.status(500).json({ error: 'Failed to fetch branding settings' });
  }
});

// Update branding settings for an instance
router.put('/instances/:id/branding', async (req, res) => {
  try {
    const { id } = req.params;
    const brandingUpdates = req.body;

    // In production, update in database
    const updatedBranding = {
      instance_id: parseInt(id),
      ...brandingUpdates,
      updated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: updatedBranding,
      message: 'Branding settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating branding settings:', error);
    res.status(500).json({ error: 'Failed to update branding settings' });
  }
});

module.exports = router;
