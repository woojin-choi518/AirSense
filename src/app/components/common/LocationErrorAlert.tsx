'use client';

import React from 'react';

interface LocationErrorAlertProps {
  error: string;
  onClose: () => void;
}

const LocationErrorAlert: React.FC<LocationErrorAlertProps> = ({ error, onClose }) => {
  return (
    <div className="absolute top-32 left-1/2 transform -translate-x-1/2 z-20 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg max-w-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="text-sm">
            <div className="font-medium mb-1">위치 서비스 오류</div>
            <div className="text-xs leading-relaxed">{error}</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="ml-2 text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default LocationErrorAlert;
