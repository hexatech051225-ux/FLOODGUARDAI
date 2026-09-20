import React from 'react';

export const AiAssistantLogo = ({ className = "w-full h-full", style = {} }) => {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 500 500"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Main blue/cyan gradient */}
        <linearGradient
          id="assistantMainGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#123B91"/>
          <stop offset="50%" stopColor="#0878E8"/>
          <stop offset="100%" stopColor="#16D8C2"/>
        </linearGradient>

        {/* Face gradient */}
        <linearGradient
          id="assistantFaceGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#071B42"/>
          <stop offset="100%" stopColor="#020A20"/>
        </linearGradient>

        {/* Glow filter */}
        <filter id="assistantGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Outer circular logo */}
      <circle
        cx="250"
        cy="250"
        r="205"
        fill="none"
        stroke="url(#assistantMainGradient)"
        strokeWidth="28"
      />

      {/* Bottom swoosh */}
      <path
        d="M100 370
           C160 440 290 465 400 390
           C420 376 438 357 450 335
           C430 380 390 420 340 440
           C245 475 145 445 100 370Z"
        fill="url(#assistantMainGradient)"
      />

      {/* Robot head */}
      <rect
        x="125"
        y="135"
        width="250"
        height="190"
        rx="75"
        fill="#F4F7FC"
      />

      {/* Robot face */}
      <rect
        x="150"
        y="160"
        width="200"
        height="140"
        rx="50"
        fill="url(#assistantFaceGradient)"
      />

      {/* Left ear */}
      <circle
        cx="130"
        cy="230"
        r="35"
        fill="#102C65"
      />

      <circle
        cx="130"
        cy="230"
        r="18"
        fill="#11D9E7"
        filter="url(#assistantGlow)"
      />

      {/* Right ear */}
      <circle
        cx="370"
        cy="230"
        r="35"
        fill="#102C65"
      />

      <circle
        cx="370"
        cy="230"
        r="18"
        fill="#11D9E7"
        filter="url(#assistantGlow)"
      />

      {/* Antenna */}
      <rect
        x="242"
        y="105"
        width="16"
        height="35"
        rx="8"
        fill="#132B60"
      />

      <circle
        cx="250"
        cy="90"
        r="25"
        fill="url(#assistantMainGradient)"
        filter="url(#assistantGlow)"
      />

      {/* Left eye */}
      <path
        d="M195 225 Q215 200 235 225"
        fill="none"
        stroke="#12DFFF"
        strokeWidth="12"
        strokeLinecap="round"
        filter="url(#assistantGlow)"
      />

      {/* Right eye */}
      <path
        d="M265 225 Q285 200 305 225"
        fill="none"
        stroke="#12DFFF"
        strokeWidth="12"
        strokeLinecap="round"
        filter="url(#assistantGlow)"
      />

      {/* Smile */}
      <path
        d="M225 250 Q250 275 275 250"
        fill="none"
        stroke="#12DFFF"
        strokeWidth="10"
        strokeLinecap="round"
        filter="url(#assistantGlow)"
      />
    </svg>
  );
};

export default AiAssistantLogo;
