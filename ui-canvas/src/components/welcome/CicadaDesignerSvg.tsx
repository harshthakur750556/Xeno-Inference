import React from "react";

export const CicadaDesignerSvg: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`relative w-full max-w-[560px] lg:max-w-[620px] aspect-square mx-auto flex items-center justify-center select-none ${className}`}>
      {/* Ambient Radial Wing Glow */}
      <div className="absolute inset-0 bg-radial from-violet-600/20 via-cyan-500/10 to-transparent blur-3xl pointer-events-none -z-10 animate-pulse duration-3000" />

      <svg
        viewBox="0 0 800 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_0_35px_rgba(6,182,212,0.35)] transition-transform duration-700 hover:scale-105"
      >
        <defs>
          {/* Gradients for Left Forewing */}
          <linearGradient id="leftForewingGrad" x1="400" y1="280" x2="60" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.85" />
            <stop offset="35%" stopColor="#6366f1" stopOpacity="0.75" />
            <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.85" />
          </linearGradient>

          {/* Gradients for Right Forewing */}
          <linearGradient id="rightForewingGrad" x1="400" y1="280" x2="740" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.85" />
            <stop offset="35%" stopColor="#ec4899" stopOpacity="0.75" />
            <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.85" />
          </linearGradient>

          {/* Gradients for Left Hindwing */}
          <linearGradient id="leftHindwingGrad" x1="400" y1="360" x2="120" y2="480" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#311042" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.85" />
          </linearGradient>

          {/* Gradients for Right Hindwing */}
          <linearGradient id="rightHindwingGrad" x1="400" y1="360" x2="680" y2="480" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3b0764" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#ec4899" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.85" />
          </linearGradient>

          {/* Body Metallic Obsidian & Gold Gradient */}
          <linearGradient id="bodyGrad" x1="400" y1="120" x2="400" y2="680" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#27272a" />
            <stop offset="30%" stopColor="#09090b" />
            <stop offset="60%" stopColor="#18181b" />
            <stop offset="100%" stopColor="#09090b" />
          </linearGradient>

          {/* Gold Accents Gradient */}
          <linearGradient id="goldChiseled" x1="360" y1="200" x2="440" y2="500" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          {/* Eye Glow Gradient */}
          <radialGradient id="eyeGlowLeft" cx="330" cy="180" r="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#0891b2" />
            <stop offset="100%" stopColor="#083344" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="eyeGlowRight" cx="470" cy="180" r="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#451a03" stopOpacity="0" />
          </radialGradient>

          {/* SVG Glow Filter */}
          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Sacred Geometry Background Circles */}
        <g opacity="0.18" stroke="#06b6d4" strokeWidth="1" strokeDasharray="3 6">
          <circle cx="400" cy="400" r="360" />
          <circle cx="400" cy="400" r="280" />
          <circle cx="400" cy="400" r="180" />
          <line x1="400" y1="20" x2="400" y2="780" stroke="#f59e0b" strokeWidth="0.8" strokeDasharray="4 8" />
          <line x1="20" y1="400" x2="780" y2="400" stroke="#f59e0b" strokeWidth="0.8" strokeDasharray="4 8" />
        </g>

        {/* ================= LEFT HINDWING ================= */}
        <path
          d="M 390 340 C 280 370 140 430 110 500 C 90 550 140 600 240 560 C 310 530 370 440 395 380 Z"
          fill="url(#leftHindwingGrad)"
          stroke="#06b6d4"
          strokeWidth="1.5"
          opacity="0.88"
        />
        {/* Left Hindwing Venation Lines */}
        <g stroke="#67e8f9" strokeWidth="0.8" opacity="0.65">
          <path d="M 380 360 C 270 420 180 490 140 540" />
          <path d="M 360 380 C 280 460 220 520 200 550" />
          <path d="M 340 400 C 290 480 260 520 250 540" />
          <path d="M 270 420 C 220 460 170 490 130 510" />
        </g>

        {/* ================= RIGHT HINDWING ================= */}
        <path
          d="M 410 340 C 520 370 660 430 690 500 C 710 550 660 600 560 560 C 490 530 430 440 405 380 Z"
          fill="url(#rightHindwingGrad)"
          stroke="#ec4899"
          strokeWidth="1.5"
          opacity="0.88"
        />
        {/* Right Hindwing Venation Lines */}
        <g stroke="#f472b6" strokeWidth="0.8" opacity="0.65">
          <path d="M 420 360 C 530 420 620 490 660 540" />
          <path d="M 440 380 C 520 460 580 520 600 550" />
          <path d="M 460 400 C 510 480 540 520 550 540" />
          <path d="M 530 420 C 580 460 630 490 670 510" />
        </g>

        {/* ================= LEFT FOREWING ================= */}
        <path
          d="M 390 260 C 280 180 120 100 60 110 C 20 120 30 200 120 310 C 200 400 320 450 385 360 Z"
          fill="url(#leftForewingGrad)"
          stroke="#38bdf8"
          strokeWidth="2"
          opacity="0.92"
        />
        {/* Left Forewing Venation Mesh */}
        <g stroke="#a5f3fc" strokeWidth="1" opacity="0.75">
          <path d="M 380 270 C 260 200 140 140 80 120" />
          <path d="M 370 290 C 270 240 160 210 100 220" />
          <path d="M 360 310 C 280 290 190 280 130 300" />
          <path d="M 350 330 C 270 350 200 370 160 380" />
          <path d="M 240 190 C 200 230 160 280 130 330" />
          <path d="M 180 160 C 140 200 110 250 90 290" />
          <path d="M 300 220 C 260 260 220 310 190 350" />
        </g>

        {/* ================= RIGHT FOREWING ================= */}
        <path
          d="M 410 260 C 520 180 680 100 740 110 C 780 120 770 200 680 310 C 600 400 480 450 415 360 Z"
          fill="url(#rightForewingGrad)"
          stroke="#fb7185"
          strokeWidth="2"
          opacity="0.92"
        />
        {/* Right Forewing Venation Mesh */}
        <g stroke="#fbcfe8" strokeWidth="1" opacity="0.75">
          <path d="M 420 270 C 540 200 660 140 720 120" />
          <path d="M 430 290 C 530 240 640 210 700 220" />
          <path d="M 440 310 C 520 290 610 280 670 300" />
          <path d="M 450 330 C 530 350 600 370 640 380" />
          <path d="M 560 190 C 600 230 640 280 670 330" />
          <path d="M 620 160 C 660 200 690 250 710 290" />
          <path d="M 500 220 C 540 260 580 310 610 350" />
        </g>

        {/* ================= CICADA LEGS ================= */}
        <g stroke="url(#goldChiseled)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
          {/* Front Legs */}
          <path d="M 360 240 L 290 210 L 240 150 L 210 160" />
          <path d="M 440 240 L 510 210 L 560 150 L 590 160" />

          {/* Middle Legs */}
          <path d="M 365 300 L 270 300 L 220 330 L 190 350" />
          <path d="M 435 300 L 530 300 L 580 330 L 610 350" />

          {/* Rear Legs */}
          <path d="M 370 380 L 290 440 L 240 500 L 210 550" />
          <path d="M 430 380 L 510 440 L 560 500 L 590 550" />
        </g>

        {/* ================= CICADA BODY / EXOSKELETON ================= */}
        {/* Abdomen (Segmented) */}
        <g>
          {/* Segment 1 */}
          <path d="M 360 380 C 360 350 440 350 440 380 L 435 420 C 435 435 365 435 365 420 Z" fill="url(#bodyGrad)" stroke="#52525b" strokeWidth="1.5" />
          {/* Segment 2 */}
          <path d="M 365 420 C 365 410 435 410 435 420 L 430 460 C 430 475 370 475 370 460 Z" fill="url(#bodyGrad)" stroke="#52525b" strokeWidth="1.5" />
          {/* Segment 3 */}
          <path d="M 370 460 C 370 450 430 450 430 460 L 425 500 C 425 515 375 515 375 500 Z" fill="url(#bodyGrad)" stroke="#52525b" strokeWidth="1.5" />
          {/* Segment 4 */}
          <path d="M 375 500 C 375 490 425 490 425 500 L 418 540 C 418 555 382 555 382 540 Z" fill="url(#bodyGrad)" stroke="#52525b" strokeWidth="1.5" />
          {/* Tail Apex */}
          <path d="M 382 540 C 382 530 418 530 418 540 L 400 620 Z" fill="url(#bodyGrad)" stroke="#d97706" strokeWidth="1.5" />
        </g>

        {/* Thorax (Pronotum & Mesonotum) */}
        <path
          d="M 345 230 C 345 200 455 200 455 230 L 450 350 C 450 370 350 370 350 350 Z"
          fill="url(#bodyGrad)"
          stroke="#f59e0b"
          strokeWidth="2"
        />

        {/* Sacred Geometry Thorax Emblem */}
        <g stroke="#f59e0b" strokeWidth="1.2" opacity="0.9">
          <polygon points="400,240 430,290 370,290" fill="none" />
          <polygon points="400,340 430,290 370,290" fill="none" />
          <circle cx="400" cy="290" r="14" fill="#09090b" stroke="#06b6d4" strokeWidth="1.5" />
          <circle cx="400" cy="290" r="4" fill="#f59e0b" />
        </g>

        {/* Head */}
        <path
          d="M 330 180 C 330 140 470 140 470 180 L 455 230 C 420 240 380 240 345 230 Z"
          fill="url(#bodyGrad)"
          stroke="#fbbf24"
          strokeWidth="2"
        />

        {/* Left Compound Eye */}
        <ellipse cx="330" cy="180" rx="20" ry="15" fill="#083344" stroke="#06b6d4" strokeWidth="2" />
        <ellipse cx="330" cy="180" rx="14" ry="10" fill="url(#eyeGlowLeft)" filter="url(#neonGlow)" />
        <circle cx="332" cy="178" r="4" fill="#ffffff" opacity="0.9" />

        {/* Right Compound Eye */}
        <ellipse cx="470" cy="180" rx="20" ry="15" fill="#451a03" stroke="#f59e0b" strokeWidth="2" />
        <ellipse cx="470" cy="180" rx="14" ry="10" fill="url(#eyeGlowRight)" filter="url(#neonGlow)" />
        <circle cx="468" cy="178" r="4" fill="#ffffff" opacity="0.9" />

        {/* Antennae */}
        <g stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round">
          <path d="M 370 150 C 350 110 320 80 290 70" />
          <circle cx="290" cy="70" r="3" fill="#06b6d4" />

          <path d="M 430 150 C 450 110 480 80 510 70" />
          <circle cx="510" cy="70" r="3" fill="#f59e0b" />
        </g>
      </svg>
    </div>
  );
};
