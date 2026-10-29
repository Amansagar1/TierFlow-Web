import React from 'react';

export const TierFlowLogo = ({ size = 'md', isDark = false, className = '' }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-14 h-14',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${iconSizes[size]} shrink-0 drop-shadow-md`}
      >
        <defs>
          <linearGradient id="tf-gold-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="tf-bronze-spine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>
        </defs>

        {/* Top Tier Bar */}
        <rect x="18" y="18" width="64" height="13" rx="6.5" fill="url(#tf-gold-glow)" />

        {/* Vertical Flow Spine */}
        <rect x="37" y="18" width="13.5" height="64" rx="6.5" fill="url(#tf-bronze-spine)" />

        {/* Middle Flow Branch */}
        <rect x="37" y="39" width="37" height="13" rx="6.5" fill="url(#tf-gold-glow)" />

        {/* Accent Flow Node */}
        <circle cx="81" cy="45.5" r="4.5" fill="#FDE68A" />
      </svg>

      <div className="flex items-baseline tracking-tight">
        <span
          className={`font-black ${textSizes[size]} ${
            isDark ? 'text-white' : 'text-[#0B1222]'
          } tracking-tight`}
        >
          Tier
        </span>
        <span className={`font-black ${textSizes[size]} text-[#D97706] ml-0.5`}>
          Flow
        </span>
      </div>
    </div>
  );
};

export default TierFlowLogo;
