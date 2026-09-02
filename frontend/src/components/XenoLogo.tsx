import React from 'react';

interface XenoLogoProps {
  size?: number;
  className?: string;
}

export const XenoLogo: React.FC<XenoLogoProps> = ({ size = 28, className = '' }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="geometricPrecision"
        className="w-full h-full"
      >
        {/* Core Outer Minimalist Diamond / Nexus Frame */}
        <polygon
          points="50,6 94,50 50,94 6,50"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          fill="none"
          strokeLinejoin="round"
          opacity="0.9"
        />

        {/* Inner Geometric "X" Tensor Convergence Blades */}
        <path
          d="M26 26 L74 74 M74 26 L26 74"
          stroke="#FFFFFF"
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* Precision Central Micro Nexus Core */}
        <circle cx="50" cy="50" r="4.5" fill="#FFFFFF" />
        <circle cx="50" cy="50" r="8" stroke="#FFFFFF" strokeWidth="1.2" strokeDasharray="3 2" opacity="0.6" />

        {/* Four Minimal Cardinal Tensor Points */}
        <circle cx="50" cy="18" r="1.8" fill="#FFFFFF" opacity="0.8" />
        <circle cx="82" cy="50" r="1.8" fill="#FFFFFF" opacity="0.8" />
        <circle cx="50" cy="82" r="1.8" fill="#FFFFFF" opacity="0.8" />
        <circle cx="18" cy="50" r="1.8" fill="#FFFFFF" opacity="0.8" />
      </svg>
    </div>
  );
};