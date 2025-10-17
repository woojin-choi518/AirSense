'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LocationButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  title?: string;
  className?: string;
}

const LocationButton: React.FC<LocationButtonProps> = ({
  onClick,
  loading = false,
  disabled = false,
  title = '현재 위치 불러오기',
  className = '',
}) => {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      whileHover={!isDisabled ? { scale: 1.08 } : {}}
      whileTap={!isDisabled ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={isDisabled}
      title={title}
      className={`
        relative flex items-center justify-center
        w-12 h-12 sm:w-14 sm:h-14
        rounded-full
        text-white
        border border-white/20
        shadow-[0_4px_20px_rgba(0,0,0,0.25)]
        backdrop-blur-xl
        bg-[rgba(255,255,255,0.15)]
        hover:bg-[rgba(255,255,255,0.25)]
        transition-all duration-300
        ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {/* 로딩 상태 */}
      {loading ? (
        <div className="w-6 h-6 sm:w-7 sm:h-7 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {/* GPS 아이콘 */}
          <svg
            className="w-6 h-6 sm:w-7 sm:h-7 text-white drop-shadow-md group-hover:text-cyan-300 transition-colors duration-300"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* 외곽 원 */}
            <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" opacity="0.85" />
            {/* 십자선 */}
            <line x1="12" y1="3" x2="12" y2="6" stroke="currentColor" strokeWidth="1.5" />
            <line x1="12" y1="18" x2="12" y2="21" stroke="currentColor" strokeWidth="1.5" />
            <line x1="3" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="1.5" />
            <line x1="18" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.5" />
            {/* 중심점 */}
            <circle cx="12" cy="12" r="2" fill="currentColor" />
          </svg>

          {/* 글로우 효과 */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/40 to-blue-500/30 opacity-0 hover:opacity-100 blur-lg transition-opacity duration-500" />
        </>
      )}
    </motion.button>
  );
};

export default LocationButton;
