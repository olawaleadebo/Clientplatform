import logoImage from 'figma:asset/267e639331ae5b3281b1b8f9c2903af5458190f3.png';

export function BTMTravelLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <div className="relative inline-block group">
      {/* Logo with glass effect overlay */}
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
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none" />
    </div>
  );
}
