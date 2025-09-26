import React from 'react';
import logo from '../assets/LogoOTOPost.png';

const LogoTest = () => {
  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Logo Test</h1>
      
      {/* Test 1: Direct import */}
      <div className="mb-8">
        <h2 className="text-xl mb-2">Direct Import:</h2>
        <img src={logo} alt="OTOPost Logo" className="h-16" />
      </div>
      
      {/* Test 2: Public path */}
      <div className="mb-8">
        <h2 className="text-xl mb-2">Public Path:</h2>
        <img src="/LogoOTOPost.png" alt="OTOPost Logo" className="h-16" />
      </div>
      
      {/* Test 3: Assets path */}
      <div className="mb-8">
        <h2 className="text-xl mb-2">Assets Path:</h2>
        <img src="/src/assets/LogoOTOPost.png" alt="OTOPost Logo" className="h-16" />
      </div>
      
      {/* Test 4: Check if file exists */}
      <div className="mb-8">
        <h2 className="text-xl mb-2">File Check:</h2>
        <p>Logo import: {logo ? 'Success' : 'Failed'}</p>
        <p>Logo type: {typeof logo}</p>
      </div>
    </div>
  );
};

export default LogoTest;
