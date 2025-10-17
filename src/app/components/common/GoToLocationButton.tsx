'use client';

import React from 'react';

interface GoToLocationButtonProps {
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  className?: string;
}

const GoToLocationButton: React.FC<GoToLocationButtonProps> = ({
  onClick,
  disabled = false,
  title = '내 위치로 이동',
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={
        'relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-white/20 ' +
        'backdrop-blur-xl bg-[rgba(255,255,255,0.14)] text-white shadow-[0_4px_20px_rgba(0,0,0,0.25)] ' +
        (disabled ? 'opacity-60 cursor-not-allowed ' : 'hover:bg-[rgba(255,255,255,0.24)] active:scale-95 cursor-pointer ') +
        'transition-all duration-300 ' +
        className
      }
    >
      {/* 크로스헤어 타겟 아이콘 */}
      <svg className="w-6 h-6 sm:w-7 sm:h-7 text-gray-500" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" opacity="0.9" />
        <line x1="12" y1="3" x2="12" y2="6" stroke="currentColor" strokeWidth="1.6" />
        <line x1="12" y1="18" x2="12" y2="21" stroke="currentColor" strokeWidth="1.6" />
        <line x1="3" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="1.6" />
        <line x1="18" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="2.2" fill="currentColor" />
      </svg>

      {/* 미세한 포커스 글로우 */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-400/30 to-blue-500/20 opacity-0 hover:opacity-100 blur-md transition-opacity duration-500" />
    </button>
  );
};

export default GoToLocationButton;
