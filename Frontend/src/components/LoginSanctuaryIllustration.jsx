const LoginSanctuaryIllustration = () => (
  <svg
    viewBox="0 0 640 480"
    role="img"
    aria-label="A young tree glowing in a peaceful twilight sanctuary"
    className="login-sanctuary-illustration"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <radialGradient id="sanctuaryHalo">
        <stop offset="0" stopColor="#a78bfa" stopOpacity=".36" />
        <stop offset=".68" stopColor="#73e0d0" stopOpacity=".12" />
        <stop offset="1" stopColor="#73e0d0" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="sanctuaryLeaf" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#b9f3a5" />
        <stop offset=".55" stopColor="#55c990" />
        <stop offset="1" stopColor="#258b78" />
      </linearGradient>
      <linearGradient id="sanctuaryTrunk" x1="0" y1="0" x2="1" y2="0">
        <stop stopColor="#d8a7d8" />
        <stop offset="1" stopColor="#9274c8" />
      </linearGradient>
      <filter id="sanctuaryGlow" x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur stdDeviation="14" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
    <circle cx="320" cy="218" r="202" fill="url(#sanctuaryHalo)" />
    <circle cx="320" cy="218" r="164" fill="none" stroke="#d4c4ff" strokeOpacity=".35" strokeWidth="2" />
    <circle cx="320" cy="218" r="178" fill="none" stroke="#79e5d5" strokeOpacity=".18" />
    <g fill="#f5e7ff" opacity=".9">
      <path d="m168 119 3 8 8 3-8 3-3 8-3-8-8-3 8-3z" />
      <path d="m465 151 2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />
      <circle cx="220" cy="186" r="2" /><circle cx="420" cy="249" r="2" />
      <circle cx="385" cy="93" r="2" /><circle cx="273" cy="79" r="1.5" />
    </g>
    <ellipse cx="320" cy="405" rx="148" ry="24" fill="#69d9c6" opacity=".16" filter="url(#sanctuaryGlow)" />
    <path d="M320 392c-4-60 3-111-3-163m2 91c-28-30-46-48-74-65m75 42c26-34 47-56 73-72m-75 126c-23-22-39-31-58-39m60 14c22-21 36-32 57-43" fill="none" stroke="url(#sanctuaryTrunk)" strokeWidth="11" strokeLinecap="round" />
    <g fill="url(#sanctuaryLeaf)" stroke="#c4f8bd" strokeOpacity=".55" strokeWidth="2" filter="url(#sanctuaryGlow)">
      <path d="M320 242c-50-4-71-37-66-74 39 3 69 26 66 74Z" />
      <path d="M322 224c7-51 43-77 81-72-4 41-33 70-81 72Z" />
      <path d="M291 278c-47 7-78-16-85-51 39-8 74 8 85 51Z" />
      <path d="M344 270c17-45 52-61 86-49-14 37-45 58-86 49Z" />
      <path d="M319 184c-36-24-41-60-19-87 33 20 45 52 19 87Z" />
      <path d="M335 193c16-42 49-57 81-43-14 34-43 53-81 43Z" />
    </g>
    <path d="M230 396c45-21 134-21 180 0l-13 13H242Z" fill="#6c5385" stroke="#c5a7f5" strokeOpacity=".55" strokeWidth="2" />
    <path d="M249 396c42-13 99-13 142 0" fill="none" stroke="#f1c5a9" strokeOpacity=".65" strokeWidth="3" />
    <g className="sanctuary-sparkles" fill="#ffd99b" filter="url(#sanctuaryGlow)">
      <circle cx="199" cy="291" r="4" /><circle cx="453" cy="316" r="3" /><circle cx="438" cy="205" r="4" />
    </g>
  </svg>
);

export default LoginSanctuaryIllustration;
