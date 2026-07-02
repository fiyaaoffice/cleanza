import React, { useState } from 'react';
// @ts-ignore
import cleanzaLogo from '../assets/images/cleanza_logo_1782968054052.png';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export default function Logo({ className = '', size = 'md', showText = false }: LogoProps) {
  const [hasError, setHasError] = useState(false);

  // Dimensions based on size (enlarged slightly)
  const dimensions = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28'
  }[size];

  // Font sizes for the text label (kept for type compatibility if needed, but not rendered)
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
            src={cleanzaLogo}
            alt="Cleanza Logo"
            className={`${dimensions} rounded-xl object-cover`}
            onError={() => {
              setHasError(true);
            }}
          />
        ) : (
          /* SVG Fallback markup if the image fails or loads slowly */
          <div className="flex items-center justify-center bg-[#017A3E] text-white rounded-xl p-2.5 border border-white/30 transform rotate-[-3deg] hover:rotate-0 transition-transform shadow-sm">
            <svg className={`${dimensions} text-[#FFD800]`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 3-1.912 5.886L5 10.8l4.088 1.914L11 18.6l1.912-5.886L17 10.8l-4.088-1.914Z"/>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}


