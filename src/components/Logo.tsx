import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export default function Logo({ className = '', size = 'md', showText = true }: LogoProps) {
  // Dimensions based on size
  const dimensions = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  }[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Real Generated Logo Asset with SVG Fallback */}
      <div className="relative shrink-0 select-none">
        <img 
          src="/src/assets/images/cleanza_logo_1782968054052.png"
          alt="Cleanza Logo"
          className={`${dimensions} rounded-xl object-cover border-2 border-[#FFD800]`}
          onError={(e) => {
            // Fallback to stylized local image or visual icon if loaded directly in iframe
            e.currentTarget.style.display = 'none';
          }}
        />
        {/* SVG Fallback markup if the image fails or loads slowly */}
        <div className="hidden only-child:flex items-center justify-center bg-[#017A3E] text-white rounded-2xl p-2.5 border-2 border-white/50 transform rotate-[-3deg] hover:rotate-0 transition-transform">
          <svg className={`${dimensions} text-[#FFD800]`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 3-1.912 5.886L5 10.8l4.088 1.914L11 18.6l1.912-5.886L17 10.8l-4.088-1.914Z"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
