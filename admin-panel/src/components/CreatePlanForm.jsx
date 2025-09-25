import React, { useState } from 'react';
import { Button } from './ui/button';

const CreatePlanForm = ({ onSave, onCancel, isDarkMode = false }) => {
  const [planName, setPlanName] = useState('');
  const [price, setPrice] = useState('');
  const [features, setFeatures] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ 
      name: planName, 
      price: parseFloat(price), 
      features: features.split(',').map(f => f.trim()),
      description: `Custom plan: ${planName}` // Add description as string
    });
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${isDarkMode ? 'text-white' : ''}`}>
      <div>
        <label htmlFor='planName' className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Plan Name</label>
        <input
          type='text'
          id='planName'
          value={planName}
          onChange={(e) => setPlanName(e.target.value)}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors ${
            isDarkMode 
              ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:bg-slate-600 focus:border-blue-400' 
              : 'border-gray-300 bg-white placeholder-gray-400'
          }`}
          required
        />
      </div>
      <div>
        <label htmlFor='price' className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Price (USD per month)</label>
        <input
          type='number'
          id='price'
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors ${
            isDarkMode 
              ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:bg-slate-600 focus:border-blue-400' 
              : 'border-gray-300 bg-white placeholder-gray-400'
          }`}
          required
        />
      </div>
      <div>
        <label htmlFor='features' className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Features (comma-separated)</label>
        <textarea
          id='features'
          value={features}
          onChange={(e) => setFeatures(e.target.value)}
          rows='3'
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors ${
            isDarkMode 
              ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:bg-slate-600 focus:border-blue-400' 
              : 'border-gray-300 bg-white placeholder-gray-400'
          }`}
          required
        />
      </div>
      <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-slate-700">
        <Button type='button' variant='outline' onClick={onCancel} className={`transition-colors ${
          isDarkMode 
            ? 'border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-700 hover:text-white' 
            : 'hover:bg-gray-50'
        }`}>Cancel</Button>
        <Button type='submit' className={`transition-colors ${
          isDarkMode 
            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}>Create Plan</Button>
      </div>
    </form>
  );
};

export default CreatePlanForm;


