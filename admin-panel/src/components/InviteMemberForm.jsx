import React, { useState } from 'react';
import { Button } from './ui/button';

const InviteMemberForm = ({ onInvite, onCancel, isDarkMode = false }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Support');

  const handleSubmit = (e) => {
    e.preventDefault();
    onInvite({ email, role });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="email" className={`block text-sm font-medium ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
            isDarkMode 
              ? 'border-slate-600 bg-slate-700 text-white placeholder-gray-400' 
              : 'border-gray-300 bg-white text-gray-900'
          }`}
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="role" className={`block text-sm font-medium ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>Role</label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className={`mt-1 block w-full pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${
            isDarkMode 
              ? 'border border-slate-600 bg-slate-700 text-white' 
              : 'border border-gray-300 bg-white text-gray-900'
          }`}
        >
          <option>Admin</option>
          <option>Support</option>
          <option>Developer</option>
          <option>Analyst</option>
        </select>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Send Invitation</Button>
      </div>
    </form>
  );
};

export default InviteMemberForm;

