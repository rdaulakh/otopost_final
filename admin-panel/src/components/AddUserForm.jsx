import React, { useState } from 'react';
import { Button } from './ui/button';

const AddUserForm = ({ onAdd, onCancel, isDarkMode = false }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState('Starter');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({ name, email, plan });
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${isDarkMode ? 'text-white' : ''}`}>
      <div>
        <label htmlFor='name' className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Name</label>
        <input
          type='text'
          id='name'
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors ${
            isDarkMode 
              ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:bg-slate-600 focus:border-blue-400' 
              : 'border-gray-300 bg-white placeholder-gray-400'
          }`}
          required
        />
      </div>
      <div>
        <label htmlFor='email' className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
        <input
          type='email'
          id='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors ${
            isDarkMode 
              ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:bg-slate-600 focus:border-blue-400' 
              : 'border-gray-300 bg-white placeholder-gray-400'
          }`}
          required
        />
      </div>
      <div>
        <label htmlFor='plan' className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Subscription Plan</label>
        <select
          id='plan'
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md transition-colors ${
            isDarkMode 
              ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600 focus:border-blue-400' 
              : 'border-gray-300 bg-white'
          }`}
        >
          <option>Starter</option>
          <option>Pro</option>
          <option>Premium</option>
        </select>
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
        }`}>Add User</Button>
      </div>
    </form>
  );
};

export default AddUserForm;


