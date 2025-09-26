import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';

const integrations = [
  {
    name: 'Slack',
    description: 'Send notifications and alerts to your Slack workspace.',
    connected: true,
  },
  {
    name: 'Google Analytics',
    description: 'Sync your website analytics for deeper insights.',
    connected: false,
  },
  {
    name: 'Stripe',
    description: 'Manage your subscriptions and payments.',
    connected: true,
  },
  {
    name: 'HubSpot',
    description: 'Sync your customer data with your HubSpot CRM.',
    connected: false,
  },
];

const Integrations = ({ isDarkMode = false }) => {
  return (
    <div className="p-6">
      <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Integrations</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <Card key={integration.name} className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>{integration.name}</CardTitle>
              <Button variant="ghost" size="icon" className={isDarkMode ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : ''}>
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{integration.description}</p>
              {integration.connected ? (
                <Button variant="outline" className={`w-full ${isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-700' : ''}`}>Disconnect</Button>
              ) : (
                <Button className={`w-full ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : ''}`}>Connect</Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Integrations;


