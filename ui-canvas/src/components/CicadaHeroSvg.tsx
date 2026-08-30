import React, { useState } from 'react';

interface CicadaHeroSvgProps {
  className?: string;
}

export const CicadaHeroSvg: React.FC<CicadaHeroSvgProps> = ({ className = '' }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`relative w-full max-w-[650px] aspect-square flex items-center justify-center select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Dynamic Ambient Background Aura */}
      <div 
        className="absolute inset-0 rounded-full blur-[90px] opacity-40 transition-all duration-700 pointer-events-none"
        style={{
          background: isHovered 
            ? 'radial-gradient(circle, rgba(0, 245, 212, 0.4) 0%, rgba(139, 92, 246, 0.4) 45%, rgba(255, 0, 127, 0.3) 75%, transparent 100%)'
            : 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, rgba(0, 245, 212, 0.25) 45%, rgba(255, 209, 102, 0.15) 75%, transparent 100%)',
          transform: isHovered ? 'scale(1.15)' : 'scale(1)',
        }}
      />

      {/* SVG Designer Artwork */}
      <svg
        viewBox="0 0 800 800"
        className="w-full h-full drop-shadow-[0_0_35px_rgba(0,245,212,0.3)] transition-all duration-700 ease-out"
        style={{
          transform: isHovered ? 'scale(1.03) translateY(-4px)' : 'scale(1) translateY(0px)',
          filter: isHovered 
            ? 'drop-shadow(0 0 50px rgba(139,92,246,0.6)) drop-shadow(0 0 25px rgba(0,245,212,0.5))' 
            : 'drop-shadow(0 0 30px rgba(139,92,246,0.35))',
        }}
      >
        <defs>
          {/* Left Wing Gradient (Cyan -> Violet -> Magenta -> Gold) */}
          <linearGradient id="leftWingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f5d4" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#06b6d4" stopOpacity="0.85" />
            <stop offset="65%" stopColor="#8b5cf6" stopOpacity="0.9" />
            <stop offset="85%" stopColor="#d946ef" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffd166" stopOpacity="0.95" />
          </linearGradient>

          {/* Right Wing Gradient (Magenta -> Violet -> Cyan -> Emerald) */}
          <linearGradient id="rightWingGrad" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ff007f" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#a855f7" stopOpacity="0.85" />
            <stop offset="65%" stopColor="#3b82f6" stopOpacity="0.9" />
            <stop offset="85%" stopColor="#00f5d4" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.95" />
          </linearGradient>

          {/* Wing Vein Glow Gradient */}
          <linearGradient id="veinGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#00f5d4" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#ffd166" stopOpacity="0.85" />
          </linearGradient>

          {/* Exoskeleton Metallic Gradient */}
          <linearGradient id="bodyArmorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2e2e42" />
            <stop offset="25%" stopColor="#151522" />
            <stop offset="50%" stopColor="#0c0c16" />
            <stop offset="75%" stopColor="#1a1a2b" />
            <stop offset="100%" stopColor="#07070d" />
          </linearGradient>

          {/* Cyber Eye Neon Amber/Ruby Gradient */}
          <radialGradient id="eyeNeonGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#ff0055" />
            <stop offset="75%" stopColor="#990022" />
            <stop offset="100%" stopColor="#33000a" />
          </radialGradient>

          {/* Hindwing Iridescent Gradient */}
          <linearGradient id="hindwingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.75" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
          </linearGradient>

          {/* Hologram Grid Filter */}
          <pattern id="runeGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* Outer Cipher Ring 1 (Sacred Geometry / 3301 Enigma Ring) */}
        <g className="animate-spin-slow origin-center">
          <circle cx="400" cy="400" r="375" fill="none" stroke="rgba(0, 245, 212, 0.15)" strokeWidth="1.2" strokeDasharray="6 14" />
          <circle cx="400" cy="400" r="350" fill="none" stroke="rgba(139, 92, 246, 0.2)" strokeWidth="1" strokeDasharray="3 9" />
          {/* Tick markers */}
          {[...Array(24)].map((_, i) => (
            <line
              key={`tick-${i}`}
              x1="400"
              y1="30"
              x2="400"
              y2={i % 6 === 0 ? "46" : "38"}
              stroke={i % 6 === 0 ? "#00f5d4" : "rgba(255,255,255,0.3)"}
              strokeWidth={i % 6 === 0 ? "2" : "1"}
              transform={`rotate(${i * 15} 400 400)`}
            />
          ))}
        </g>

        {/* Reverse Rotating Counter-Ring */}
        <g className="animate-spin-reverse-slow origin-center">
          <circle cx="400" cy="400" r="315" fill="none" stroke="rgba(255, 0, 127, 0.18)" strokeWidth="1" strokeDasharray="8 20" />
          <polygon 
            points="400,95 664,248 664,552 400,705 136,552 136,248" 
            fill="none" 
            stroke="rgba(139, 92, 246, 0.12)" 
            strokeWidth="1" 
          />
          <polygon 
            points="400,705 664,552 664,248 400,95 136,248 136,552" 
            fill="none" 
            stroke="rgba(0, 245, 212, 0.1)" 
            strokeWidth="1" 
            transform="rotate(30 400 400)"
          />
        </g>

        {/* Cicada Body Group */}
        <g className="animate-float origin-center">
          
          {/* ===== LEFT HINDWING ===== */}
          <g opacity="0.85">
            <path
              d="M 380 380 C 260 410, 130 520, 110 630 C 130 670, 230 640, 310 550 C 350 500, 375 430, 380 380 Z"
              fill="url(#hindwingGrad)"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1.2"
            />
            {/* Hindwing inner veins */}
            <path d="M 380 380 Q 230 520 160 635" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.6" />
            <path d="M 340 450 Q 230 550 210 625" fill="none" stroke="#ffffff" strokeWidth="0.7" opacity="0.5" />
            <path d="M 360 410 Q 200 480 135 590" fill="none" stroke="#ffffff" strokeWidth="0.7" opacity="0.5" />
          </g>

          {/* ===== RIGHT HINDWING ===== */}
          <g opacity="0.85">
            <path
              d="M 420 380 C 540 410, 670 520, 690 630 C 670 670, 570 640, 490 550 C 450 500, 425 430, 420 380 Z"
              fill="url(#hindwingGrad)"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1.2"
            />
            {/* Hindwing inner veins */}
            <path d="M 420 380 Q 570 520 640 635" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.6" />
            <path d="M 460 450 Q 570 550 590 625" fill="none" stroke="#ffffff" strokeWidth="0.7" opacity="0.5" />
            <path d="M 440 410 Q 600 480 665 590" fill="none" stroke="#ffffff" strokeWidth="0.7" opacity="0.5" />
          </g>

          {/* ===== LEFT FOREWING (GRAND GRADIENT WING) ===== */}
          <g className="transition-all duration-500 origin-top-right">
            {/* Wing Base Membrane */}
            <path
              d="M 375 280 C 260 210, 80 260, 25 420 C -5 490, 40 560, 130 540 C 240 515, 330 420, 375 280 Z"
              fill="url(#leftWingGrad)"
              stroke="url(#veinGlow)"
              strokeWidth="2.5"
              className="filter drop-shadow-[0_0_15px_rgba(0,245,212,0.5)]"
            />

            {/* Wing Cells Texture / Patterns */}
            <path
              d="M 375 280 C 260 210, 80 260, 25 420 C -5 490, 40 560, 130 540 C 240 515, 330 420, 375 280 Z"
              fill="url(#runeGrid)"
              opacity="0.3"
            />

            {/* Major Structural Costa & Subcosta Veins */}
            <path d="M 375 280 C 270 230, 100 280, 25 420" fill="none" stroke="#ffffff" strokeWidth="2.8" opacity="0.9" />
            <path d="M 375 280 C 250 280, 100 370, 45 490" fill="none" stroke="url(#veinGlow)" strokeWidth="1.8" />
            <path d="M 375 280 C 280 340, 160 450, 110 535" fill="none" stroke="url(#veinGlow)" strokeWidth="1.6" />

            {/* Intricate Micro-Venation Net */}
            <path d="M 280 250 Q 200 320 150 400" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.75" />
            <path d="M 200 270 Q 130 350 80 440" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.75" />
            <path d="M 120 310 Q 70 390 35 460" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.7" />
            <path d="M 250 320 Q 200 420 160 490" fill="none" stroke="#00f5d4" strokeWidth="1.2" opacity="0.8" />
            <path d="M 310 330 Q 270 410 230 470" fill="none" stroke="#ffd166" strokeWidth="1" opacity="0.8" />
            <path d="M 180 370 Q 130 460 100 515" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.6" />
          </g>

          {/* ===== RIGHT FOREWING (GRAND GRADIENT WING) ===== */}
          <g className="transition-all duration-500 origin-top-left">
            {/* Wing Base Membrane */}
            <path
              d="M 425 280 C 540 210, 720 260, 775 420 C 805 490, 760 560, 670 540 C 560 515, 470 420, 425 280 Z"
              fill="url(#rightWingGrad)"
              stroke="url(#veinGlow)"
              strokeWidth="2.5"
              className="filter drop-shadow-[0_0_15px_rgba(255,0,127,0.5)]"
            />

            {/* Wing Cells Texture / Patterns */}
            <path
              d="M 425 280 C 540 210, 720 260, 775 420 C 805 490, 760 560, 670 540 C 560 515, 470 420, 425 280 Z"
              fill="url(#runeGrid)"
              opacity="0.3"
            />

            {/* Major Structural Costa & Subcosta Veins */}
            <path d="M 425 280 C 530 230, 700 280, 775 420" fill="none" stroke="#ffffff" strokeWidth="2.8" opacity="0.9" />
            <path d="M 425 280 C 550 280, 700 370, 755 490" fill="none" stroke="url(#veinGlow)" strokeWidth="1.8" />
            <path d="M 425 280 C 520 340, 640 450, 690 535" fill="none" stroke="url(#veinGlow)" strokeWidth="1.6" />

            {/* Intricate Micro-Venation Net */}
            <path d="M 520 250 Q 600 320 650 400" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.75" />
            <path d="M 600 270 Q 670 350 720 440" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.75" />
            <path d="M 680 310 Q 730 390 765 460" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.7" />
            <path d="M 550 320 Q 600 420 640 490" fill="none" stroke="#ff007f" strokeWidth="1.2" opacity="0.8" />
            <path d="M 490 330 Q 530 410 570 470" fill="none" stroke="#00f5d4" strokeWidth="1" opacity="0.8" />
            <path d="M 620 370 Q 670 460 700 515" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.6" />
          </g>

          {/* ===== CICADA CENTRAL EXOSKELETON BODY ===== */}
          <g>
            {/* Abdomen Segments (Cyber Armor Plates) */}
            <g>
              {/* Abdomen base */}
              <path
                d="M 370 360 C 365 480, 375 580, 400 650 C 425 580, 435 480, 430 360 Z"
                fill="url(#bodyArmorGrad)"
                stroke="rgba(0, 245, 212, 0.4)"
                strokeWidth="1.5"
              />

              {/* Segment Horizontal Grooves */}
              {[390, 425, 460, 495, 530, 565, 600, 630].map((y, idx) => (
                <path
                  key={`seg-${idx}`}
                  d={`M ${372 + idx * 2.5} ${y} Q 400 ${y + 8} ${428 - idx * 2.5} ${y}`}
                  fill="none"
                  stroke={idx % 2 === 0 ? "#00f5d4" : "#8b5cf6"}
                  strokeWidth="1.2"
                  opacity="0.8"
                />
              ))}

              {/* Dorsal Spine Light Ribbon */}
              <line x1="400" y1="360" x2="400" y2="640" stroke="#00f5d4" strokeWidth="1.5" strokeDasharray="3 3" />
            </g>

            {/* Thorax / Mesonotum (Shield Armor) */}
            <path
              d="M 360 260 C 350 310, 360 360, 400 375 C 440 360, 450 310, 440 260 Z"
              fill="url(#bodyArmorGrad)"
              stroke="#8b5cf6"
              strokeWidth="2"
            />
            {/* Mesonotum W-shaped Crest Emblem */}
            <path
              d="M 375 285 L 390 330 L 400 305 L 410 330 L 425 285"
              fill="none"
              stroke="#ffd166"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Pronotum / Collar Armor */}
            <path
              d="M 350 215 C 340 240, 350 260, 400 265 C 450 260, 460 240, 450 215 Z"
              fill="url(#bodyArmorGrad)"
              stroke="rgba(0, 245, 212, 0.5)"
              strokeWidth="1.5"
            />

            {/* Head Capsule */}
            <path
              d="M 345 180 C 340 205, 355 220, 400 222 C 445 220, 460 205, 455 180 C 440 160, 360 160, 345 180 Z"
              fill="url(#bodyArmorGrad)"
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth="1.5"
            />

            {/* Ocelli (3 Golden Triangle Forehead Sensors) */}
            <circle cx="400" cy="180" r="3.5" fill="#ffd166" className="animate-pulse" />
            <circle cx="392" cy="187" r="2.8" fill="#ffd166" />
            <circle cx="408" cy="187" r="2.8" fill="#ffd166" />

            {/* Left Compound Eye (Glowing Ruby/Neon Red Orb) */}
            <g className="filter drop-shadow-[0_0_12px_rgba(255,0,85,0.9)]">
              <ellipse cx="340" cy="188" rx="16" ry="24" fill="url(#eyeNeonGrad)" transform="rotate(-15 340 188)" />
              <ellipse cx="338" cy="184" rx="5" ry="8" fill="#ffffff" opacity="0.75" />
            </g>

            {/* Right Compound Eye (Glowing Ruby/Neon Red Orb) */}
            <g className="filter drop-shadow-[0_0_12px_rgba(255,0,85,0.9)]">
              <ellipse cx="460" cy="188" rx="16" ry="24" fill="url(#eyeNeonGrad)" transform="rotate(15 460 188)" />
              <ellipse cx="462" cy="184" rx="5" ry="8" fill="#ffffff" opacity="0.75" />
            </g>

            {/* Antennae (Neural Sensor Probes) */}
            <path d="M 370 165 Q 345 130 320 120" fill="none" stroke="#00f5d4" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="320" cy="120" r="2.5" fill="#00f5d4" className="animate-ping" />

            <path d="M 430 165 Q 455 130 480 120" fill="none" stroke="#00f5d4" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="480" cy="120" r="2.5" fill="#00f5d4" className="animate-ping" />

            {/* Jointed Cyber-Legs */}
            {/* Front Left Leg */}
            <path d="M 350 250 L 300 230 L 250 270" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" />
            {/* Front Right Leg */}
            <path d="M 450 250 L 500 230 L 550 270" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" />

            {/* Mid Left Leg */}
            <path d="M 360 310 L 290 320 L 240 390" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" />
            {/* Mid Right Leg */}
            <path d="M 440 310 L 510 320 L 560 390" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" />

            {/* Rear Left Leg */}
            <path d="M 370 360 L 310 430 L 270 520" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" />
            {/* Rear Right Leg */}
            <path d="M 430 360 L 490 430 L 530 520" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" />
          </g>
        </g>
      </svg>
    </div>
  );
};
