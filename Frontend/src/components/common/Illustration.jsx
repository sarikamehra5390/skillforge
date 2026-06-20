import React from 'react';

const Illustration = ({ name, className }) => {
  const illustrations = {
    treeOfMastery: (
      <svg viewBox="0 0 1200 700" className={className}>
        <defs>
          <radialGradient id="moonlightGlow" cx="50%" cy="20%" r="40%">
            <stop offset="0%" stopColor="#e0e7ff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#e0e7ff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4c1d95" />
            <stop offset="50%" stopColor="#6d28d9" />
            <stop offset="100%" stopColor="#4c1d95" />
          </linearGradient>
          <radialGradient id="leafGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="fireflyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <radialGradient id="lanternGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="rootGlow" cx="50%" cy="100%" r="50%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Night Sky Background */}
        <rect x="0" y="0" width="1200" height="700" fill="#0a0a0f" />
        <circle cx="600" cy="140" r="400" fill="url(#moonlightGlow)" />
        
        {/* Stars */}
        {[...Array(40)].map((_, i) => (
          <circle
            key={`star-${i}`}
            cx={50 + Math.random() * 1100}
            cy={30 + Math.random() * 250}
            r={0.5 + Math.random() * 1.5}
            fill="#e0e7ff"
            opacity={0.3 + Math.random() * 0.7}
          >
            <animate
              attributeName="opacity"
              values={`${0.3 + Math.random() * 0.5};${0.8 + Math.random() * 0.2};${0.3 + Math.random() * 0.5}`}
              dur={`${2 + Math.random() * 3}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
        
        {/* Constellations */}
        <g stroke="#a78bfa" strokeWidth="1" strokeLinecap="round" opacity="0.3">
          <line x1="200" y1="80" x2="250" y2="120" />
          <line x1="250" y1="120" x2="300" y2="90" />
          <line x1="300" y1="90" x2="320" y2="140" />
          <circle cx="200" cy="80" r="3" fill="#a78bfa" />
          <circle cx="250" cy="120" r="2" fill="#a78bfa" />
          <circle cx="300" cy="90" r="2.5" fill="#a78bfa" />
          <circle cx="320" cy="140" r="2" fill="#a78bfa" />
        </g>
        <g stroke="#f472b6" strokeWidth="1" strokeLinecap="round" opacity="0.3">
          <line x1="900" y1="60" x2="950" y2="100" />
          <line x1="950" y1="100" x2="1000" y2="70" />
          <line x1="1000" y1="70" x2="1020" y2="120" />
          <circle cx="900" cy="60" r="3" fill="#f472b6" />
          <circle cx="950" cy="100" r="2" fill="#f472b6" />
          <circle cx="1000" cy="70" r="2.5" fill="#f472b6" />
          <circle cx="1020" cy="120" r="2" fill="#f472b6" />
        </g>
        
        {/* Ground */}
        <ellipse cx="600" cy="680" rx="800" ry="100" fill="#1e1e2e" />
        <ellipse cx="600" cy="650" rx="700" ry="80" fill="url(#rootGlow)" />
        
        {/* Tree Roots */}
        <path d="M450 600 Q400 650 350 680 Q380 660 450 600" fill="#4c1d95" opacity="0.6" />
        <path d="M500 620 Q450 670 400 690 Q430 670 500 620" fill="#5b21b6" opacity="0.5" />
        <path d="M750 600 Q800 650 850 680 Q820 660 750 600" fill="#4c1d95" opacity="0.6" />
        <path d="M700 620 Q750 670 800 690 Q770 670 700 620" fill="#5b21b6" opacity="0.5" />
        <path d="M600 630 Q580 660 550 685 Q570 665 600 630" fill="#6d28d9" opacity="0.4" />
        <path d="M600 630 Q620 660 650 685 Q630 665 600 630" fill="#6d28d9" opacity="0.4" />
        
        {/* Tree Trunk */}
        <path d="M580 600 Q570 500 580 400 Q590 300 600 250 Q610 300 620 400 Q630 500 620 600 Z" fill="url(#trunkGradient)" />
        <path d="M585 600 Q575 500 585 400 Q595 300 600 250 Q605 300 615 400 Q625 500 615 600 Z" fill="#5b21b6" opacity="0.5" />
        
        {/* Main Branches */}
        <path d="M580 400 Q500 350 420 300" stroke="#6d28d9" strokeWidth="18" fill="none" strokeLinecap="round" />
        <path d="M620 400 Q700 350 780 300" stroke="#6d28d9" strokeWidth="18" fill="none" strokeLinecap="round" />
        <path d="M600 320 Q600 280 600 220" stroke="#6d28d9" strokeWidth="15" fill="none" strokeLinecap="round" />
        <path d="M550 350 Q480 320 410 360" stroke="#7c3aed" strokeWidth="12" fill="none" strokeLinecap="round" />
        <path d="M650 350 Q720 320 790 360" stroke="#7c3aed" strokeWidth="12" fill="none" strokeLinecap="round" />
        <path d="M600 250 Q550 200 500 220" stroke="#7c3aed" strokeWidth="10" fill="none" strokeLinecap="round" />
        <path d="M600 250 Q650 200 700 220" stroke="#7c3aed" strokeWidth="10" fill="none" strokeLinecap="round" />
        
        {/* Foliage Clusters (Skills) */}
        {[
          { x: 420, y: 280, color: "#a78bfa", size: 80 },
          { x: 390, y: 340, color: "#f472b6", size: 70 },
          { x: 780, y: 280, color: "#60a5fa", size: 75 },
          { x: 820, y: 350, color: "#34d399", size: 65 },
          { x: 480, y: 210, color: "#fbbf24", size: 70 },
          { x: 720, y: 210, color: "#f472b6", size: 75 },
          { x: 600, y: 170, color: "#a78bfa", size: 90 },
          { x: 530, y: 250, color: "#60a5fa", size: 65 },
          { x: 670, y: 250, color: "#34d399", size: 65 },
        ].map((leaf, i) => (
          <g key={`leaf-${i}`} filter="url(#glow)">
            <circle cx={leaf.x} cy={leaf.y} r={leaf.size / 2} fill={leaf.color} opacity="0.2" />
            <circle cx={leaf.x} cy={leaf.y} r={leaf.size / 2.5} fill={leaf.color} opacity="0.3" />
            <circle cx={leaf.x} cy={leaf.y} r={leaf.size / 3.5} fill={leaf.color} opacity="0.5" />
          </g>
        ))}
        
        {/* Lanterns on Branches */}
        {[
          { x: 480, y: 320, delay: "0s" },
          { x: 720, y: 310, delay: "0.5s" },
          { x: 600, y: 240, delay: "1s" },
        ].map((lantern, i) => (
          <g key={`lantern-${i}`} transform={`translate(${lantern.x}, ${lantern.y})`}>
            <path d="M0 0 L-3 20 L3 20 Z" fill="#78350f" />
            <rect x="-12" y="18" width="24" height="30" rx="4" fill="#fbbf24" opacity="0.8" />
            <rect x="-10" y="20" width="20" height="26" rx="3" fill="#fbbf24" opacity="0.6" />
            <ellipse cx="0" cy="32" rx="40" ry="30" fill="url(#lanternGlow)" />
          </g>
        ))}
        
        {/* Books and Journal at Base */}
        <rect x="480" y="580" width="60" height="35" rx="4" fill="#f472b6" opacity="0.8" transform="rotate(-5, 510, 597)" />
        <rect x="490" y="565" width="55" height="32" rx="4" fill="#a78bfa" opacity="0.8" transform="rotate(3, 517, 581)" />
        <rect x="630" y="575" width="70" height="40" rx="5" fill="#f8fafc" opacity="0.9" transform="rotate(2, 665, 595)" />
        <rect x="635" y="580" width="60" height="30" rx="3" fill="#e2e8f0" opacity="0.7" transform="rotate(2, 665, 595)" />
        <circle cx="695" cy="585" r="5" fill="#a78bfa" />
        
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <circle
            key={`particle-${i}`}
            cx={100 + Math.random() * 1000}
            cy={100 + Math.random() * 400}
            r={1 + Math.random() * 2}
            fill={i % 2 === 0 ? "#a78bfa" : "#f472b6"}
            opacity={0.5}
          >
            <animate
              attributeName="cy"
              values={`${100 + Math.random() * 400};${50 + Math.random() * 400};${100 + Math.random() * 400}`}
              dur={`${4 + Math.random() * 6}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0;0.6;0"
              dur={`${4 + Math.random() * 6}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
        
        {/* Fireflies */}
        {[...Array(12)].map((_, i) => (
          <circle
            key={`firefly-${i}`}
            cx={150 + Math.random() * 900}
            cy={200 + Math.random() * 350}
            r="3"
            fill="url(#fireflyGradient)"
            filter="url(#glow)"
          >
            <animate
              attributeName="cx"
              values={`${150 + Math.random() * 900};${150 + Math.random() * 900};${150 + Math.random() * 900}`}
              dur={`${5 + Math.random() * 10}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="cy"
              values={`${200 + Math.random() * 350};${200 + Math.random() * 350};${200 + Math.random() * 350}`}
              dur={`${5 + Math.random() * 10}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0;0.9;0"
              dur={`${2 + Math.random() * 3}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </svg>
    ),
    growthTree: (
      <svg viewBox="0 0 500 500" className={className}>
        <defs>
          <radialGradient id="treeGlowSimple" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        <circle cx="250" cy="250" r="200" fill="url(#treeGlowSimple)" />
        
        {/* Tree */}
        <path d="M230 480 Q220 420 230 350 Q240 280 250 230 Q260 280 270 350 Q280 420 270 480 Z" fill="#4c1d95" opacity="0.8" />
        
        {/* Branches */}
        <path d="M240 320 Q190 280 150 250" stroke="#6d28d9" strokeWidth="10" fill="none" strokeLinecap="round" />
        <path d="M260 320 Q310 280 350 250" stroke="#6d28d9" strokeWidth="10" fill="none" strokeLinecap="round" />
        <path d="M250 260 Q250 200 250 150" stroke="#6d28d9" strokeWidth="8" fill="none" strokeLinecap="round" />
        
        {/* Foliage */}
        <circle cx="150" cy="230" r="40" fill="#a78bfa" opacity="0.3" />
        <circle cx="350" cy="230" r="40" fill="#f472b6" opacity="0.3" />
        <circle cx="250" cy="130" r="50" fill="#34d399" opacity="0.3" />
        <circle cx="210" cy="180" r="35" fill="#60a5fa" opacity="0.3" />
        <circle cx="290" cy="180" r="35" fill="#fbbf24" opacity="0.3" />
      </svg>
    ),
    studySanctuary: (
      <svg viewBox="0 0 500 500" className={className}>
        <defs>
          <radialGradient id="lampGlowSimple" cx="70%" cy="30%" r="40%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        <rect x="0" y="0" width="500" height="500" fill="#0a0a0f" />
        <circle cx="350" cy="80" r="200" fill="url(#lampGlowSimple)" />
        
        {/* Desk */}
        <rect x="50" y="380" width="400" height="25" rx="10" fill="#1e1e2e" stroke="#334155" strokeWidth="3" />
        <rect x="80" y="405" width="25" height="100" fill="#1e1e2e" stroke="#334155" strokeWidth="2" />
        <rect x="395" y="405" width="25" height="100" fill="#1e1e2e" stroke="#334155" strokeWidth="2" />
        
        {/* Books */}
        <rect x="70" y="340" width="70" height="18" rx="3" fill="#a78bfa" opacity="0.7" />
        <rect x="75" y="325" width="60" height="18" rx="3" fill="#f472b6" opacity="0.7" />
        <rect x="65" y="358" width="80" height="22" rx="3" fill="#60a5fa" opacity="0.7" />
        
        {/* Journal */}
        <rect x="230" y="335" width="120" height="45" rx="8" fill="#f8fafc" opacity="0.9" />
        <rect x="235" y="340" width="110" height="35" rx="5" fill="#e2e8f0" opacity="0.7" />
        
        {/* Coffee Cup */}
        <rect x="370" y="330" width="45" height="38" rx="5" fill="#f59e0b" opacity="0.8" />
        <ellipse cx="392.5" cy="330" rx="22.5" ry="6" fill="#fbbf24" opacity="0.9" />
        <path d="M415 335 Q450 335 450 350 Q450 365 415 368" stroke="#f59e0b" strokeWidth="4" fill="none" opacity="0.8" />
        
        {/* Steam */}
        <path d="M385 325 Q380 310 385 300 Q390 290 385 280" stroke="#f8fafc" strokeWidth="2" fill="none" opacity="0.6">
          <animate attributeName="d" values="M385 325 Q380 310 385 300 Q390 290 385 280;M385 325 Q390 310 385 300 Q380 290 385 280;M385 325 Q380 310 385 300 Q390 290 385 280" dur="3s" repeatCount="indefinite" />
        </path>
        
        {/* Lamp */}
        <rect x="400" y="260" width="12" height="100" rx="6" fill="#334155" />
        <path d="M380 250 Q406 230 432 250 L432 290 L380 290 Z" fill="#fbbf24" opacity="0.85" />
      </svg>
    ),
    constellationOfSkills: (
      <svg viewBox="0 0 500 500" className={className}>
        <defs>
          <radialGradient id="starGlowSimple" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        <circle cx="250" cy="250" r="250" fill="url(#starGlowSimple)" />
        
        {/* Background Stars */}
        {[...Array(25)].map((_, i) => (
          <circle
            key={`bg-star-${i}`}
            cx={30 + Math.random() * 440}
            cy={30 + Math.random() * 440}
            r={0.8 + Math.random() * 1.5}
            fill="#94a3b8"
            opacity={0.3 + Math.random() * 0.6}
          />
        ))}
        
        {/* Constellation */}
        <g stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" opacity="0.6">
          <line x1="100" y1="150" x2="160" y2="200" />
          <line x1="160" y1="200" x2="230" y2="160" />
          <line x1="230" y1="160" x2="280" y2="220" />
          <line x1="280" y1="220" x2="210" y2="300" />
          <line x1="210" y1="300" x2="140" y2="260" />
          <line x1="140" y1="260" x2="160" y2="200" />
          <line x1="340" y1="180" x2="400" y2="220" />
          <line x1="400" y1="220" x2="380" y2="300" />
          <line x1="380" y1="300" x2="320" y2="340" />
        </g>
        
        {/* Bright Stars */}
        <circle cx="100" cy="150" r="7" fill="#fbbf24" filter="url(#glow)" />
        <circle cx="160" cy="200" r="5" fill="#a78bfa" filter="url(#glow)" />
        <circle cx="230" cy="160" r="6" fill="#f472b6" filter="url(#glow)" />
        <circle cx="280" cy="220" r="5.5" fill="#60a5fa" filter="url(#glow)" />
        <circle cx="210" cy="300" r="6.5" fill="#34d399" filter="url(#glow)" />
        <circle cx="140" cy="260" r="5" fill="#a78bfa" filter="url(#glow)" />
        <circle cx="340" cy="180" r="6" fill="#fbbf24" filter="url(#glow)" />
        <circle cx="400" cy="220" r="5" fill="#60a5fa" filter="url(#glow)" />
        <circle cx="380" cy="300" r="5.5" fill="#f472b6" filter="url(#glow)" />
        <circle cx="320" cy="340" r="6" fill="#34d399" filter="url(#glow)" />
        
        {/* Center Star */}
        <circle cx="250" cy="250" r="12" fill="#fbbf24" stroke="#fbbf24" strokeWidth="3" filter="url(#glow)" />
      </svg>
    )
  };

  return illustrations[name] || null;
};

export default Illustration;
