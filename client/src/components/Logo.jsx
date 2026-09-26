const Logo = ({ size = 'md', showText = true, className = '' }) => {
  const iconSizes = {
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-9 h-9 rounded-xl',
    lg: 'w-12 h-12 rounded-2xl',
    xl: 'w-16 h-16 sm:w-20 sm:h-20 rounded-3xl',
  };

  const svgSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-10 h-10 sm:w-12 sm:h-12',
  };

  const textSizes = {
    sm: 'text-base font-extrabold',
    md: 'text-xl font-black',
    lg: 'text-2xl font-black',
    xl: 'text-3xl sm:text-4xl font-black',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Icon Badge */}
      <div
        className={`${iconSizes[size] || iconSizes.md} bg-gradient-to-br from-orange-500 via-amber-500 to-rose-600 flex items-center justify-center shadow-lg shadow-orange-500/20 flex-shrink-0 transition-transform duration-300 group-hover:scale-105 border border-white/20`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${svgSizes[size] || svgSizes.md} text-white drop-shadow-sm`}
        >
          {/* Pilot Crown Star */}
          <path
            d="M12 2L13.1 4.5L15.5 5.5L13.1 6.5L12 9L10.9 6.5L8.5 5.5L10.9 4.5L12 2Z"
            fill="currentColor"
          />

          {/* Luxury Cloche Dome with Aerodynamic Wings */}
          <path
            d="M4 14C4.2 9.8 7.5 7 12 7C16.5 7 19.8 9.8 20 14H4Z"
            fill="currentColor"
          />

          {/* Aerodynamic Pilot Wing Lines */}
          <path
            d="M2 14.5C3.5 13.2 5.5 12.5 8 12.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.8"
          />
          <path
            d="M22 14.5C20.5 13.2 18.5 12.5 16 12.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Platter Base */}
          <rect x="3" y="15.5" width="18" height="2" rx="1" fill="currentColor" />

          {/* Digital Smart Compass Pip */}
          <circle cx="12" cy="11.5" r="1.25" fill="#fef08a" />
        </svg>
      </div>

      {showText && (
        <span
          className={`${textSizes[size] || textSizes.md} tracking-tight leading-none select-none flex items-center`}
        >
          <span className="text-warm-900 font-black">Restro</span>
          <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-rose-600 bg-clip-text text-transparent font-black ml-0.5">
            Pilot
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 ml-1 inline-block" />
        </span>
      )}
    </div>
  );
};

export default Logo;
