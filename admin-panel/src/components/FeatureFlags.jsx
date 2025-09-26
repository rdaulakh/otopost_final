import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Search } from 'lucide-react';

const initialFeatureFlags = [
  {
    id: 'new-dashboard',
    name: 'New Dashboard UI',
    description: 'Enable the new and improved dashboard design.',
    enabled: true,
    percentage: 100,
  },
  {
    id: 'ai-content-suggestions',
    name: 'AI Content Suggestions',
    description: 'Provide AI-powered content suggestions in the post editor.',
    enabled: true,
    percentage: 50,
  },
  {
    id: 'advanced-analytics',
    name: 'Advanced Analytics',
    description: 'Unlock the new advanced analytics and reporting module.',
    enabled: false,
    percentage: 0,
  },
];

const FeatureFlags = ({ isDarkMode = false }) => {
  const [featureFlags, setFeatureFlags] = useState(initialFeatureFlags);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFeatureFlags = featureFlags.filter(
    (flag) =>
      flag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flag.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggle = (id) => {
    setFeatureFlags((prevFlags) =>
      prevFlags.map((flag) =>
        flag.id === id ? { ...flag, enabled: !flag.enabled } : flag
      )
    );
  };

  return (
    <div className="p-6">
      <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Feature Flags</h1>
      <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
        <CardHeader>
          <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Manage Feature Flags and Rollouts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search feature flags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`max-w-sm ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' : ''}`}
              />
              <Search className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            <Button className={isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : ''}>
              <PlusCircle className="h-5 w-5 mr-2" />
              Create Feature Flag
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow className={isDarkMode ? 'border-slate-700' : ''}>
                <TableHead className={isDarkMode ? 'text-white' : ''}>Feature</TableHead>
                <TableHead className={isDarkMode ? 'text-white' : ''}>Description</TableHead>
                <TableHead className={isDarkMode ? 'text-white' : ''}>Status</TableHead>
                <TableHead className={isDarkMode ? 'text-white' : ''}>Rollout Percentage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFeatureFlags.map((flag) => (
                <TableRow key={flag.id} className={isDarkMode ? 'border-slate-700 hover:bg-slate-700/50' : ''}>
                  <TableCell className={isDarkMode ? 'text-white' : ''}>{flag.name}</TableCell>
                  <TableCell className={isDarkMode ? 'text-gray-300' : ''}>{flag.description}</TableCell>
                  <TableCell>
                    <Switch
                      checked={flag.enabled}
                      onCheckedChange={() => handleToggle(flag.id)}
                    />
                  </TableCell>
                  <TableCell className={isDarkMode ? 'text-white' : ''}>{flag.percentage}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeatureFlags;


