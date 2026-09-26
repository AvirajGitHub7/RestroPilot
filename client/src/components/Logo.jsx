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
    md: 'text-xl font-extrabold',
    lg: 'text-2xl font-black',
    xl: 'text-3xl sm:text-4xl font-black',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div
        className={`${iconSizes[size] || iconSizes.md} bg-gradient-brand flex items-center justify-center shadow-brand shadow-sm flex-shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:shadow-brand-lg`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${svgSizes[size] || svgSizes.md} text-white`}
        >
          {/* Steam Swirl */}
          <path
            d="M10.5 4.5c0-.8.6-1.5 1.2-1.9.7-.5.9-.9.7-1.3-.2.4-.8.7-1.3 1.1-.6.5-.9 1.2-.6 2.1z"
            fill="currentColor"
            opacity="0.9"
          />
          <path
            d="M13.8 4c0-.6.4-1.1.8-1.4.5-.3.6-.6.5-.8-.1.2-.6.5-.9.7-.4.3-.6.8-.4 1.5z"
            fill="currentColor"
            opacity="0.8"
          />

          {/* Cloche Dome Knob */}
          <circle cx="12" cy="7" r="1.5" fill="currentColor" />

          {/* Cloche Dome */}
          <path
            d="M5 16c.2-4.2 3.4-7.5 7-7.5s6.8 3.3 7 7.5H5z"
            fill="currentColor"
          />

          {/* Platter Base */}
          <rect x="3.5" y="17" width="17" height="2" rx="1" fill="currentColor" />

          {/* Digital QR Spark Accent */}
          <rect x="11" y="12" width="2" height="2" rx="0.5" fill="#ea580c" />
        </svg>
      </div>

      {showText && (
        <span
          className={`${textSizes[size] || textSizes.md} bg-gradient-to-r from-brand-600 via-brand-500 to-accent-600 bg-clip-text text-transparent tracking-tight leading-none select-none`}
        >
          Restro<span className="text-amber-500">Pilot</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
