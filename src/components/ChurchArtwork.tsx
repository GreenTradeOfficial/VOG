import React from 'react';

interface ChurchArtworkProps {
  theme: 'worship' | 'sermon' | 'bible' | 'fellowship' | 'communion' | 'cross' | 'dawn';
  title?: string;
  subtitle?: string;
  aspect?: '16:9' | '4:3' | 'square' | 'wide';
  className?: string;
}

export const ChurchArtwork: React.FC<ChurchArtworkProps> = ({
  theme,
  title,
  subtitle,
  aspect = '16:9',
  className = '',
}) => {
  const aspectClasses = {
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    square: 'aspect-square',
    wide: 'aspect-[21/9]',
  }[aspect];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl select-none ${aspectClasses} ${className}`}
    >
      {/* Background gradients and stained glass sacred architecture textures */}
      {theme === 'worship' && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B2545] via-[#133E87] to-[#0A1128]">
          <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="lightRay" cx="50%" cy="10%" r="80%">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#DC2626" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#0B2545" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#lightRay)" />
            {/* Stage Light Cones */}
            <polygon points="50,0 20,100 80,100" fill="#FCD34D" opacity="0.15" />
            <polygon points="20,0 0,100 50,100" fill="#60A5FA" opacity="0.1" />
            <polygon points="80,0 50,100 100,100" fill="#F87171" opacity="0.1" />
            {/* Worshipping Congregation Silhouettes */}
            <circle cx="25" cy="85" r="4" fill="#0B2545" opacity="0.8" />
            <path d="M22 88 Q25 82 28 88 L29 100 L21 100 Z" fill="#0B2545" opacity="0.8" />
            <path d="M18 80 L23 85" stroke="#0B2545" strokeWidth="2" strokeLinecap="round" />
            
            <circle cx="50" cy="82" r="5" fill="#0B2545" opacity="0.9" />
            <path d="M45 86 Q50 78 55 86 L56 100 L44 100 Z" fill="#0B2545" opacity="0.9" />
            <path d="M43 75 L48 82" stroke="#0B2545" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M57 75 L52 82" stroke="#0B2545" strokeWidth="2.5" strokeLinecap="round" />

            <circle cx="75" cy="84" r="4" fill="#0B2545" opacity="0.8" />
            <path d="M72 87 Q75 81 78 87 L79 100 L71 100 Z" fill="#0B2545" opacity="0.8" />
            <path d="M82 78 L77 84" stroke="#0B2545" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      )}

      {theme === 'sermon' && (
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0F172A] via-[#1E293B] to-[#0B2545]">
          <svg className="absolute inset-0 w-full h-full opacity-25" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50%" cy="35%" r="60" fill="#D97706" opacity="0.3" filter="blur(20px)" />
            {/* Pulpit and cross */}
            <line x1="50%" y1="15%" x2="50%" y2="55%" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
            <line x1="42%" y1="28%" x2="58%" y2="28%" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
            {/* Open scripture rays */}
            <path d="M40 70 Q50 65 50 75 Q50 65 60 70 L60 85 Q50 80 50 88 Q50 80 40 85 Z" fill="#F59E0B" opacity="0.6" />
          </svg>
        </div>
      )}

      {theme === 'bible' && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E1B4B] via-[#0B2545] to-[#1E3A8A]">
          <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50%" cy="50%" r="80" fill="#F59E0B" opacity="0.2" />
            {/* Glowing scripture book */}
            <g transform="translate(50, 45) scale(0.7)">
              <path d="M-40 0 C-20 -10 -5 -5 0 5 C5 -5 20 -10 40 0 L40 30 C20 20 5 25 0 35 C-5 25 -20 20 -40 30 Z" fill="#FFFFFF" opacity="0.9" />
              <line x1="0" y1="5" x2="0" y2="35" stroke="#D97706" strokeWidth="2" />
              <line x1="-30" y1="8" x2="-10" y2="6" stroke="#94A3B8" strokeWidth="1.5" />
              <line x1="-30" y1="14" x2="-10" y2="12" stroke="#94A3B8" strokeWidth="1.5" />
              <line x1="-30" y1="20" x2="-15" y2="18" stroke="#94A3B8" strokeWidth="1.5" />
              <line x1="10" y1="6" x2="30" y2="8" stroke="#94A3B8" strokeWidth="1.5" />
              <line x1="10" y1="12" x2="30" y2="14" stroke="#94A3B8" strokeWidth="1.5" />
              <line x1="10" y1="18" x2="25" y2="20" stroke="#94A3B8" strokeWidth="1.5" />
            </g>
          </svg>
        </div>
      )}

      {theme === 'fellowship' && (
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0C1E3A] via-[#1E3A8A] to-[#3B82F6]">
          <svg className="absolute inset-0 w-full h-full opacity-25" xmlns="http://www.w3.org/2000/svg">
            <circle cx="30%" cy="40%" r="50" fill="#F59E0B" opacity="0.3" />
            <circle cx="70%" cy="40%" r="50" fill="#DC2626" opacity="0.2" />
          </svg>
        </div>
      )}

      {theme === 'communion' && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#450A0A] via-[#0B2545] to-[#1E1B4B]">
          <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50%" cy="50%" r="60" fill="#DC2626" opacity="0.4" />
          </svg>
        </div>
      )}

      {theme === 'cross' && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A192F] via-[#0B2545] to-[#1E3A8A]">
          <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
            <line x1="50%" y1="15%" x2="50%" y2="85%" stroke="#FCD34D" strokeWidth="4" strokeLinecap="round" />
            <line x1="32%" y1="38%" x2="68%" y2="38%" stroke="#FCD34D" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
      )}

      {theme === 'dawn' && (
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0F172A] via-[#1E3A8A] to-[#D97706]">
          <div className="absolute inset-0 bg-black/20" />
        </div>
      )}

      {/* Decorative Gold & Stained Glass Accents */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />

      {/* Text Overlay if present */}
      {(title || subtitle) && (
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
          {subtitle && (
            <p className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider mb-0.5">
              {subtitle}
            </p>
          )}
          {title && (
            <h4 className="text-sm md:text-base font-bold text-white line-clamp-2 drop-shadow-sm">
              {title}
            </h4>
          )}
        </div>
      )}
    </div>
  );
};
