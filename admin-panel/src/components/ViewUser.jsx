import React from 'react';

const ViewUser = ({ user, isDarkMode = false }) => {
  if (!user) return null;

  return (
    <div className="space-y-4">
      <div>
        <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.name}</h3>
        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>{user.email}</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Company</p>
          <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.company}</p>
        </div>
        <div>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Subscription</p>
          <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.subscription}</p>
        </div>
        <div>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Status</p>
          <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.status}</p>
        </div>
        <div>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Revenue</p>
          <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${user.revenue}</p>
        </div>
      </div>
    </div>
  );
};

export default ViewUser;

