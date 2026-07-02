import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export default function Logo({ className = '', size = 'md', showText = true }: LogoProps) {
  const [hasError, setHasError] = useState(false);

  // Dimensions based on size
  const dimensions = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  }[size];

  // Font sizes for the text label
  const textSizes = {
    sm: 'text-base font-bold',
    md: 'text-xl font-extrabold tracking-tight',
    lg: 'text-2xl font-black tracking-tight',
    xl: 'text-4xl font-black tracking-tight'
  }[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Real Generated Logo Asset with SVG Fallback */}
      <div className="relative shrink-0 select-none">
        {!hasError ? (
          <img 
            src="./src/assets/images/cleanza_logo_1782968054052.png"
            alt="Cleanza Logo"
            className={`${dimensions} rounded-xl object-cover`}
            onError={() => {
              setHasError(true);
            }}
          />

      {showText && (
        </span>
      )}
    </div>
  );
}

