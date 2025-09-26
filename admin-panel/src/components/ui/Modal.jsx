import React from 'react';

const Modal = ({ isOpen, onClose, title, children, isDarkMode = false }) => {
  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center ${isDarkMode ? 'dark' : ''}`}>
      <div className={`rounded-lg shadow-xl w-full max-w-md m-4 ${
        isDarkMode ? 'bg-slate-800 border border-slate-700 dark' : 'bg-white border border-gray-200'
      }`}>
        <div className={`flex justify-between items-center p-4 border-b ${
          isDarkMode ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>{title}</h3>
          <button onClick={onClose} className={`${
            isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
          }`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;


