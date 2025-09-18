import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { handleFileUpload } from '../utils/fileUpload';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Palette, 
  Upload, 
  Eye, 
  Globe, 
  Settings, 
  Monitor, 
  Smartphone, 
  Tablet,
  RefreshCw,
  Save,
  Download,
  Copy,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  AlertTriangle,
  Image as ImageIcon,
  Type,
  Layout,
  Code,
  Link,
  Mail,
  Phone
} from 'lucide-react';

const WhiteLabelSettings = ({ isDarkMode = false }) => {
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('branding');

  // Branding Settings
  const [brandingSettings, setBrandingSettings] = useState({
    company_name: 'Your Company Name',
    company_logo: '/api/placeholder/200/80',
    favicon: '/api/placeholder/32/32',
    primary_color: '#3B82F6',
    secondary_color: '#1E40AF',
    accent_color: '#F59E0B',
    background_color: '#F8FAFC',
    text_color: '#1F2937',
    font_family: 'Inter',
    custom_css: '',
    footer_text: '© 2024 Your Company Name. All rights reserved.',
    support_email: 'support@yourcompany.com',
    support_phone: '+1 (555) 123-4567'
  });

  // Domain Settings
  const [domainSettings, setDomainSettings] = useState({
    custom_domain: 'app.yourcompany.com',
    ssl_enabled: true,
    subdomain_prefix: 'app',
    redirect_www: true,
    force_https: true,
    dns_status: 'configured'
  });

  // White Label Instances
  const [instances, setInstances] = useState([
    { 
      id: 1, 
      name: 'Enterprise Client A', 
      domain: 'client-a.yourapp.com', 
      status: 'active', 
      users: 150, 
      created: '2024-01-15',
      plan: 'Enterprise',
      custom_branding: true
    },
    { 
      id: 2, 
      name: 'Startup Client B', 
      domain: 'client-b.yourapp.com', 
      status: 'active', 
      users: 25, 
      created: '2024-02-20',
      plan: 'Pro',
      custom_branding: true
    },
    { 
      id: 3, 
      name: 'Agency Client C', 
      domain: 'client-c.yourapp.com', 
      status: 'pending', 
      users: 0, 
      created: '2024-03-10',
      plan: 'Premium',
      custom_branding: false
    }
  ]);

  // Email Templates
  const [emailTemplates, setEmailTemplates] = useState([
    { id: 1, name: 'Welcome Email', subject: 'Welcome to {{company_name}}!', status: 'active', last_modified: '2024-09-15' },
    { id: 2, name: 'Password Reset', subject: 'Reset your {{company_name}} password', status: 'active', last_modified: '2024-09-10' },
    { id: 3, name: 'Invoice Notification', subject: 'Your {{company_name}} invoice is ready', status: 'active', last_modified: '2024-09-05' },
    { id: 4, name: 'Feature Update', subject: 'New features in {{company_name}}', status: 'draft', last_modified: '2024-09-01' }
  ]);

  // Feature Customization
  const [featureCustomization, setFeatureCustomization] = useState({
    hide_powered_by: true,
    custom_login_page: true,
    custom_dashboard: false,
    white_label_mobile_app: true,
    custom_help_docs: false,
    branded_emails: true,
    custom_onboarding: false,
    api_whitelabeling: true
  });

  const handleSaveChanges = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    setHasChanges(false);
  };

  const handleFileUpload = (type) => {
    // Simulate file upload
    console.log(`Uploading ${type}...`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return isDarkMode ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800';
      case 'pending': return isDarkMode ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-800';
      case 'inactive': return isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800';
      case 'configured': return isDarkMode ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800';
      case 'draft': return isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800';
      default: return isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'branding', name: 'Branding', icon: Palette },
    { id: 'domains', name: 'Custom Domains', icon: Globe },
    { id: 'instances', name: 'White Label Instances', icon: Monitor },
    { id: 'emails', name: 'Email Templates', icon: Mail },
    { id: 'features', name: 'Feature Customization', icon: Settings }
  ];

  const renderBranding = () => (
    <div className="space-y-6">
      {/* Company Information */}
      <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
        <CardHeader>
          <CardTitle className={`flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <Type className="h-5 w-5 mr-2" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Company Name
              </label>
              <input
                type="text"
                value={brandingSettings.company_name}
                onChange={(e) => {
                  setBrandingSettings(prev => ({ ...prev, company_name: e.target.value }));
                  setHasChanges(true);
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'border-slate-600 bg-slate-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Support Email
              </label>
              <input
                type="email"
                value={brandingSettings.support_email}
                onChange={(e) => {
                  setBrandingSettings(prev => ({ ...prev, support_email: e.target.value }));
                  setHasChanges(true);
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'border-slate-600 bg-slate-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Support Phone
              </label>
              <input
                type="tel"
                value={brandingSettings.support_phone}
                onChange={(e) => {
                  setBrandingSettings(prev => ({ ...prev, support_phone: e.target.value }));
                  setHasChanges(true);
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'border-slate-600 bg-slate-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Footer Text
              </label>
              <input
                type="text"
                value={brandingSettings.footer_text}
                onChange={(e) => {
                  setBrandingSettings(prev => ({ ...prev, footer_text: e.target.value }));
                  setHasChanges(true);
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'border-slate-600 bg-slate-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logo and Assets */}
      <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
        <CardHeader>
          <CardTitle className={`flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <ImageIcon className="h-5 w-5 mr-2" />
            Logo and Assets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Company Logo
              </label>
              <div className={`border-2 border-dashed rounded-lg p-6 text-center ${isDarkMode ? 'border-slate-600 bg-slate-700/50' : 'border-gray-300'}`}>
                <img 
                  src={brandingSettings.company_logo} 
                  alt="Company Logo" 
                  className="mx-auto h-16 w-auto mb-4"
                />
                <input type="file" id="logo-upload" className="hidden" onChange={(e) => handleFileUpload(e, (dataUrl) => setBrandingSettings(prev => ({...prev, company_logo: dataUrl})))} />
<Button variant="outline" onClick={() => document.getElementById("logo-upload").click()} className={isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-700' : ''}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Logo
                </Button>
                <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>PNG, JPG up to 2MB. Recommended: 200x80px</p>
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Favicon
              </label>
              <div className={`border-2 border-dashed rounded-lg p-6 text-center ${isDarkMode ? 'border-slate-600 bg-slate-700/50' : 'border-gray-300'}`}>
                <img 
                  src={brandingSettings.favicon} 
                  alt="Favicon" 
                  className="mx-auto h-8 w-8 mb-4"
                />
                <input type="file" id="favicon-upload" className="hidden" onChange={(e) => handleFileUpload(e, (dataUrl) => setBrandingSettings(prev => ({...prev, favicon: dataUrl})))} />
<Button variant="outline" onClick={() => document.getElementById("favicon-upload").click()} className={isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-700' : ''}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Favicon
                </Button>
                <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>ICO, PNG 32x32px</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Color Scheme */}
      <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
        <CardHeader>
          <CardTitle className={`flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <Palette className="h-5 w-5 mr-2" />
            Color Scheme
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: 'primary_color', label: 'Primary Color', description: 'Main brand color for buttons and links' },
              { key: 'secondary_color', label: 'Secondary Color', description: 'Supporting color for accents' },
              { key: 'accent_color', label: 'Accent Color', description: 'Highlight color for special elements' },
              { key: 'background_color', label: 'Background Color', description: 'Main background color' },
              { key: 'text_color', label: 'Text Color', description: 'Primary text color' }
            ].map(({ key, label, description }) => (
              <div key={key} className={`p-4 rounded-lg border transition-all hover:shadow-sm ${
                isDarkMode 
                  ? 'border-slate-700 bg-slate-800/50 hover:bg-slate-800' 
                  : 'border-gray-200 bg-gray-50 hover:bg-white'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {label}
                  </label>
                  <div 
                    className="w-6 h-6 rounded border shadow-sm"
                    style={{ backgroundColor: brandingSettings[key] }}
                  />
                </div>
                <p className={`text-xs mb-3 leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {description}
                </p>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={brandingSettings[key]}
                    onChange={(e) => {
                      setBrandingSettings(prev => ({ ...prev, [key]: e.target.value }));
                      setHasChanges(true);
                    }}
                    className={`w-10 h-8 border rounded cursor-pointer transition-all hover:scale-105 ${
                      isDarkMode 
                        ? 'border-slate-600 hover:border-slate-500' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  />
                  <input
                    type="text"
                    value={brandingSettings[key]}
                    onChange={(e) => {
                      setBrandingSettings(prev => ({ ...prev, [key]: e.target.value }));
                      setHasChanges(true);
                    }}
                    className={`flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 font-mono text-sm ${
                      isDarkMode 
                        ? 'border-slate-600 bg-slate-700 text-white placeholder-gray-400' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="#000000"
                  />
                </div>
              </div>
            ))}
          </div>
          
          {/* Color Preview Section */}
          <div className={`mt-6 p-4 rounded-lg border ${
            isDarkMode 
              ? 'border-slate-700 bg-slate-800/30' 
              : 'border-gray-200 bg-gray-50'
          }`}>
            <h4 className={`text-base font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Color Preview
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Button Styles
                </h5>
                <div className="space-y-2">
                  <button 
                    className="px-3 py-2 rounded text-white text-sm font-medium transition-all hover:opacity-90"
                    style={{ backgroundColor: brandingSettings.primary_color }}
                  >
                    Primary Button
                  </button>
                  <button 
                    className="px-3 py-2 rounded text-sm font-medium border transition-all hover:opacity-90"
                    style={{ 
                      backgroundColor: brandingSettings.background_color,
                      color: brandingSettings.text_color,
                      borderColor: brandingSettings.primary_color
                    }}
                  >
                    Secondary Button
                  </button>
                </div>
              </div>
              <div>
                <h5 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Text Preview
                </h5>
                <div 
                  className="p-3 rounded"
                  style={{ 
                    backgroundColor: brandingSettings.background_color,
                    color: brandingSettings.text_color
                  }}
                >
                  <h6 className="font-semibold mb-1 text-sm">Sample Heading</h6>
                  <p className="text-xs leading-relaxed">This is how your text will appear with the selected colors. The background and text colors work together to create a cohesive design.</p>
                  <span 
                    className="text-xs font-medium"
                    style={{ color: brandingSettings.accent_color }}
                  >
                    Accent text example
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
        <CardHeader>
          <CardTitle className={`flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <Type className="h-5 w-5 mr-2" />
            Typography
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Font Family
            </label>
            <select
              value={brandingSettings.font_family}
              onChange={(e) => {
                setBrandingSettings(prev => ({ ...prev, font_family: e.target.value }));
                setHasChanges(true);
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                isDarkMode 
                  ? 'border-slate-600 bg-slate-700 text-white' 
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
            >
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
              <option value="Lato">Lato</option>
              <option value="Montserrat">Montserrat</option>
              <option value="Poppins">Poppins</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Custom CSS */}
      <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
        <CardHeader>
          <CardTitle className={`flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <Code className="h-5 w-5 mr-2" />
            Custom CSS
          </CardTitle>
          <CardDescription>Add custom CSS to further customize the appearance</CardDescription>
        </CardHeader>
        <CardContent>
          <textarea
            value={brandingSettings.custom_css}
            onChange={(e) => {
              setBrandingSettings(prev => ({ ...prev, custom_css: e.target.value }));
              setHasChanges(true);
            }}
            placeholder="/* Add your custom CSS here */"
            className={`w-full h-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm ${
              isDarkMode 
                ? 'border-slate-600 bg-slate-700 text-white' 
                : 'border-gray-300 bg-white text-gray-900'
            }`}
          />
        </CardContent>
      </Card>
    </div>
  );

  const renderDomains = () => (
    <div className="space-y-6">
      <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
        <CardHeader>
          <CardTitle className={`flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <Globe className="h-5 w-5 mr-2" />
            Custom Domain Configuration
          </CardTitle>
          <CardDescription>Configure your custom domain for white-label deployment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Custom Domain
              </label>
              <input
                type="text"
                value={domainSettings.custom_domain}
                onChange={(e) => {
                  setDomainSettings(prev => ({ ...prev, custom_domain: e.target.value }));
                  setHasChanges(true);
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'border-slate-600 bg-slate-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
                placeholder="app.yourcompany.com"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                DNS Status
              </label>
              <div className="flex items-center space-x-2">
                <Badge className={getStatusColor(domainSettings.dns_status)}>
                  {domainSettings.dns_status}
                </Badge>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Check DNS
                </Button>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            {[
              { key: 'ssl_enabled', label: 'Enable SSL Certificate' },
              { key: 'redirect_www', label: 'Redirect WWW to non-WWW' },
              { key: 'force_https', label: 'Force HTTPS Redirect' }
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id={key}
                  checked={domainSettings[key]}
                  onChange={(e) => {
                    setDomainSettings(prev => ({ ...prev, [key]: e.target.checked }));
                    setHasChanges(true);
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={key} className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {label}
                </label>
              </div>
            ))}
          </div>

          <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
            <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>DNS Configuration</h4>
            <p className={`text-sm mb-3 ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>Add these DNS records to your domain:</p>
            <div className="space-y-2 font-mono text-sm">
              <div className={`p-2 rounded border ${isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-300'}`}>
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Type:</span> CNAME<br/>
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Name:</span> app<br/>
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Value:</span> your-app.herokuapp.com
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderInstances = () => (
    <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className={`flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <Monitor className="h-5 w-5 mr-2" />
            White Label Instances
          </CardTitle>
          <Button className={isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : ''}>
            <Plus className="h-4 w-4 mr-2" />
            Create Instance
          </Button>
        </div>
        <CardDescription>Manage white-label instances for your clients</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {instances.map((instance) => (
            <div key={instance.id} className={`flex items-center justify-between p-4 border rounded-lg ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-gray-200'}`}>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{instance.name}</h4>
                  <Badge className={getStatusColor(instance.status)}>
                    {instance.status}
                  </Badge>
                  <Badge variant="outline">{instance.plan}</Badge>
                </div>
                <div className={`text-sm space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <div className="flex items-center space-x-4">
                    <span>Domain: {instance.domain}</span>
                    <span>Users: {instance.users}</span>
                    <span>Created: {instance.created}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>Custom Branding:</span>
                    {instance.custom_branding ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className={isDarkMode ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : ''}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className={isDarkMode ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : ''}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className={`text-red-600 hover:text-red-700 ${isDarkMode ? 'hover:bg-slate-700' : ''}`}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderEmailTemplates = () => (
    <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className={`flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <Mail className="h-5 w-5 mr-2" />
            Email Templates
          </CardTitle>
          <Button className={isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : ''}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
        <CardDescription>Customize email templates with your branding</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {emailTemplates.map((template) => (
            <div key={template.id} className={`flex items-center justify-between p-4 border rounded-lg ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-gray-200'}`}>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-1">
                  <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{template.name}</h4>
                  <Badge className={getStatusColor(template.status)}>
                    {template.status}
                  </Badge>
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <div>Subject: {template.subject}</div>
                  <div>Last modified: {template.last_modified}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className={isDarkMode ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : ''}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className={isDarkMode ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : ''}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className={isDarkMode ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : ''}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderFeatures = () => (
    <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
      <CardHeader>
        <CardTitle className={`flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <Settings className="h-5 w-5 mr-2" />
          Feature Customization
        </CardTitle>
        <CardDescription>Control which features are available in white-label instances</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(featureCustomization).map(([key, enabled]) => (
            <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className={`font-medium capitalize ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {key.replace(/_/g, ' ')}
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {enabled ? 'Enabled for white-label instances' : 'Disabled for white-label instances'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => {
                    setFeatureCustomization(prev => ({ ...prev, [key]: e.target.checked }));
                    setHasChanges(true);
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'branding': return renderBranding();
      case 'domains': return renderDomains();
      case 'instances': return renderInstances();
      case 'emails': return renderEmailTemplates();
      case 'features': return renderFeatures();
      default: return renderBranding();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>White Label Settings</h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Customize branding and create white-label instances</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className={isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-700' : ''}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button 
            onClick={handleSaveChanges}
            disabled={!hasChanges || isLoading}
            className={isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            {isLoading ? (
              <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
            ) : (
              <><Save className="h-4 w-4 mr-2" /> Save Changes</>
            )}
          </Button>
        </div>
      </div>

      {/* White Label Tabs */}
      <div className={`border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:border-gray-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {renderContent()}
    </div>
  );
};

export default WhiteLabelSettings;

