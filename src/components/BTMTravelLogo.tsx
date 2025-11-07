import logoImage from 'figma:asset/da4baf9e9e75fccb7e053a2cc52f5b251f4636a9.png';

export function BTMTravelLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <div className="relative inline-block group">
      {/* BTM Travel Logo */}
      <img
        src={logoImage}
        alt="BTM Travel Logo" 
        className={className}
        style={{ 
          objectFit: 'contain',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))'
        }}
      />
      
      {/* Subtle shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
}
