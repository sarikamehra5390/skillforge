import React from 'react';
import { cn } from '../../utils/cn';

const Companion = ({ 
  mood = 'neutral', 
  className, 
  size = 120,
  message 
}) => {
  const moods = {
    neutral: "animate-soft-float",
    happy: "animate-bounce",
    proud: "animate-breathing",
    sleeping: "opacity-60 grayscale-[0.5]"
  };

  return (
    <div className={cn("relative flex flex-col items-center group", className)}>
      {/* Speech Bubble */}
      {message && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl text-[10px] font-bold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-2xl z-20">
          {message}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white/10 border-r border-b border-white/10 rotate-45" />
        </div>
      )}

      {/* Spirit Fox SVG */}
      <div 
        className={cn("relative transition-all duration-1000", moods[mood])}
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_15px_rgba(167,139,250,0.4)]">
          {/* Body */}
          <path d="M100 160C140 160 170 130 170 90C170 50 140 20 100 20C60 20 30 50 30 90C30 130 60 160 100 160Z" fill="url(#fox-gradient)" fillOpacity="0.8"/>
          
          {/* Ears */}
          <path d="M60 40L30 10L45 55L60 40Z" fill="#a78bfa" />
          <path d="M140 40L170 10L155 55L140 40Z" fill="#a78bfa" />
          
          {/* Inner Ears */}
          <path d="M60 40L40 25L48 50L60 40Z" fill="#f472b6" fillOpacity="0.3" />
          <path d="M140 40L160 25L152 50L140 40Z" fill="#f472b6" fillOpacity="0.3" />

          {/* Eyes */}
          {mood === 'sleeping' ? (
            <>
              <path d="M70 90Q80 95 90 90" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <path d="M110 90Q120 95 130 90" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="80" cy="90" r="4" fill="white" className={mood === 'happy' ? 'animate-pulse' : ''} />
              <circle cx="120" cy="90" r="4" fill="white" className={mood === 'happy' ? 'animate-pulse' : ''} />
            </>
          )}

          {/* Blush */}
          <circle cx="65" cy="105" r="8" fill="#f472b6" fillOpacity="0.2" />
          <circle cx="135" cy="105" r="8" fill="#f472b6" fillOpacity="0.2" />

          {/* Markings */}
          <path d="M100 30C110 30 115 40 115 50C115 60 110 70 100 70C90 70 85 60 85 50C85 40 90 30 100 30Z" fill="white" fillOpacity="0.1" />

          {/* Tail */}
          <path d="M170 90C190 90 200 110 200 130C200 150 180 170 150 170C130 170 110 160 100 150" stroke="#a78bfa" strokeWidth="15" strokeLinecap="round" fill="none" opacity="0.6" className="animate-pulse" />

          <defs>
            <radialGradient id="fox-gradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(100 90) rotate(90) scale(70)">
              <stop stopColor="#a78bfa" />
              <stop offset="1" stopColor="#7c3aed" stopOpacity="0.6" />
            </radialGradient>
          </defs>
        </svg>

        {/* Magical Glow Aura */}
        <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-2xl -z-10 animate-glow-pulse" />
      </div>
    </div>
  );
};

export default Companion;
