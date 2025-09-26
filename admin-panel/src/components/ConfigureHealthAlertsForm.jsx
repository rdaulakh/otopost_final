import React, { useState } from 'react';
import { Button } from './ui/button';

const ConfigureHealthAlertsForm = ({ onSave, onCancel, config }) => {
  const [thresholds, setThresholds] = useState(config.thresholds);
  const [notificationChannels, setNotificationChannels] = useState(config.notificationChannels);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ thresholds, notificationChannels });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Alert Thresholds</h4>
        <div className="space-y-4">
          <div>
            <label htmlFor="cpu" className="block text-sm font-medium text-gray-700">CPU Usage (%)</label>
            <input
              type="number"
              id="cpu"
              value={thresholds.cpu}
              onChange={(e) => setThresholds({ ...thresholds, cpu: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="memory" className="block text-sm font-medium text-gray-700">Memory Usage (%)</label>
            <input
              type="number"
              id="memory"
              value={thresholds.memory}
              onChange={(e) => setThresholds({ ...thresholds, memory: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="disk" className="block text-sm font-medium text-gray-700">Disk Usage (%)</label>
            <input
              type="number"
              id="disk"
              value={thresholds.disk}
              onChange={(e) => setThresholds({ ...thresholds, disk: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
      </div>
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Notification Channels</h4>
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="email"
              checked={notificationChannels.email}
              onChange={(e) => setNotificationChannels({ ...notificationChannels, email: e.target.checked })}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="email" className="ml-2 block text-sm text-gray-900">Email</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="slack"
              checked={notificationChannels.slack}
              onChange={(e) => setNotificationChannels({ ...notificationChannels, slack: e.target.checked })}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="slack" className="ml-2 block text-sm text-gray-900">Slack</label>
          </div>
        </div>
      </div>
      <div className="flex justify-end space-x-4 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Configuration</Button>
      </div>
    </form>
  );
};

export default ConfigureHealthAlertsForm;


