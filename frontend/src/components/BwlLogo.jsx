import React from 'react';

export default function BwlLogo({ size = 48, className = '', showText = false }) {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 512 512"
        width={size}
        height={size}
        className="shrink-0 drop-shadow-md select-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="bwlBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0284c7" />
            <stop offset="50%" stop-color="#0369a1" />
            <stop offset="100%" stop-color="#0f172a" />
          </linearGradient>

          <linearGradient id="bwlRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#38bdf8" />
            <stop offset="50%" stop-color="#0284c7" />
            <stop offset="100%" stop-color="#0369a1" />
          </linearGradient>

          <linearGradient id="bwlGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fef08a" />
            <stop offset="50%" stop-color="#facc15" />
            <stop offset="100%" stop-color="#eab308" />
          </linearGradient>

          <linearGradient id="bwlWater" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.9" />
            <stop offset="50%" stop-color="#0ea5e9" stop-opacity="0.95" />
            <stop offset="100%" stop-color="#0284c7" stop-opacity="1" />
          </linearGradient>

          <filter id="bwlGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Squircle Badge */}
        <rect x="24" y="24" width="464" height="464" rx="104" fill="url(#bwlBgGrad)" />
        <rect x="24" y="24" width="464" height="464" rx="104" fill="none" stroke="#38bdf8" stroke-width="4" stroke-opacity="0.35" />

        {/* Outer Ring */}
        <circle cx="256" cy="230" r="180" fill="none" stroke="#38bdf8" stroke-width="2" stroke-opacity="0.2" stroke-dasharray="8 8" />

        {/* Washing Drum Rim */}
        <circle cx="256" cy="226" r="126" fill="#0b1e33" stroke="url(#bwlRingGrad)" stroke-width="14" filter="url(#bwlGlow)" />
        <circle cx="256" cy="226" r="114" fill="#081524" />

        {/* Drum Shimmer Reflection */}
        <path d="M 170 180 A 114 114 0 0 1 330 160 A 114 114 0 0 0 170 180 Z" fill="#ffffff" fill-opacity="0.12" />

        {/* Waves & Bubbles in Drum */}
        <g clipPath="url(#bwlDrumClip)">
          <clipPath id="bwlDrumClip">
            <circle cx="256" cy="226" r="110" />
          </clipPath>
          <path d="M 130 240 Q 190 270 256 240 T 382 240 L 382 340 L 130 340 Z" fill="#0369a1" opacity="0.6" />
          <path d="M 130 252 Q 190 225 256 255 T 382 250 L 382 340 L 130 340 Z" fill="url(#bwlWater)" />
          <circle cx="210" cy="235" r="7" fill="#ffffff" opacity="0.6" />
          <circle cx="295" cy="245" r="9" fill="#ffffff" opacity="0.5" />
          <circle cx="245" cy="265" r="5" fill="#ffffff" opacity="0.7" />
        </g>

        {/* Monogram BWL */}
        <text x="256" y="244" font-family="'Plus Jakarta Sans', sans-serif" font-size="78" font-weight="900" text-anchor="middle" letterSpacing="4" fill="#ffffff">
          BWL
        </text>
        <text x="256" y="272" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="800" text-anchor="middle" letterSpacing="3" fill="#38bdf8">
          BASMALAH WASH
        </text>

        {/* Sparkles */}
        <path d="M 390 105 Q 390 125 410 125 Q 390 125 390 145 Q 390 125 370 125 Q 390 125 390 105 Z" fill="url(#bwlGold)" filter="url(#bwlGlow)" />
        <path d="M 105 155 Q 105 170 120 170 Q 105 170 105 185 Q 105 170 90 170 Q 105 170 105 155 Z" fill="url(#bwlGold)" />

        {/* Bottom Pill Badge */}
        <g transform="translate(0, 375)">
          <rect x="76" y="0" width="360" height="66" rx="33" fill="#0b1b2d" stroke="#38bdf8" stroke-width="2" stroke-opacity="0.4" />
          <text x="256" y="29" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="900" text-anchor="middle" fill="#ffffff" letterSpacing="2.5">
            BASMALAH WASH
          </text>
          <text x="256" y="49" font-family="'Plus Jakarta Sans', sans-serif" font-size="10.5" font-weight="700" text-anchor="middle" fill="#38bdf8" letterSpacing="3">
            LAUNDRY MEMBER RFID
          </text>
        </g>
      </svg>

      {showText && (
        <div className="leading-tight">
          <div className="font-black text-sm tracking-tight text-slate-900 flex items-center gap-1.5">
            <span>BASMALAH WASH</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-100 text-sky-700 font-extrabold">BWL</span>
          </div>
          <p className="text-[10px] font-medium text-slate-500">Laundry Member RFID</p>
        </div>
      )}
    </div>
  );
}

