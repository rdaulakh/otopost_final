import React, { useState } from 'react';

const EditUserForm = ({ user, onSave, onCancel, isDarkMode = false }) => {
  const [formData, setFormData] = useState(user);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Name</label>
          <input type='text' name='name' value={formData.name} onChange={handleChange} className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
            isDarkMode 
              ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' 
              : 'border-gray-300 bg-white'
          }`} />
        </div>
        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
          <input type='email' name='email' value={formData.email} onChange={handleChange} className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
            isDarkMode 
              ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' 
              : 'border-gray-300 bg-white'
          }`} />
        </div>
        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Company</label>
          <input type='text' name='company' value={formData.company} onChange={handleChange} className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
            isDarkMode 
              ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' 
              : 'border-gray-300 bg-white'
          }`} />
        </div>
        <div className="flex justify-end space-x-2">
          <button type='button' onClick={onCancel} className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            isDarkMode 
              ? 'text-gray-300 bg-slate-700 border border-slate-600 hover:bg-slate-600' 
              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
          }`}>Cancel</button>
          <button type='submit' className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            isDarkMode 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}>Save</button>
        </div>
      </div>
    </form>
  );
};

export default EditUserForm;

