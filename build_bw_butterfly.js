const fs = require('fs');

const rawSvg = fs.readFileSync('C:/Users/harsh/Downloads/Untitled.svg', 'utf8');
const pathMatches = rawSvg.match(/<path\s+[^>]*>/g) || [];

const paths = pathMatches.map((p, idx) => {
  let d = (p.match(/d="([^"]+)"/) || [null, ''])[1];
  const fill = (p.match(/fill="([^"]+)"/) || [null, ''])[1];
  
  if (idx === 0) {
    d = d.replace(/^M184 690v460h736V230H184zm594-359\.2/, 'M778 330.8');
  }

  // Crisp Monochrome Shading mapping
  let color = '#FFFFFF';
  let opacity = '1';

  if (fill === '#555') {
    color = '#71717A'; // zinc-500
    opacity = '0.9';
  } else if (fill === 'gray') {
    color = '#A1A1AA'; // zinc-400
    opacity = '0.95';
  } else if (fill === '#aaa') {
    color = '#D4D4D8'; // zinc-300
    opacity = '0.98';
  } else if (fill === '#d4d4d4') {
    color = '#F4F4F5'; // zinc-100
    opacity = '1';
  }

  return { idx, color, opacity, d };
});

const componentCode = `import React from 'react';

interface ButterflySvgProps {
  className?: string;
  size?: number;
}

export const ButterflySvg: React.FC<ButterflySvgProps> = ({
  className = '',
  size = 420,
}) => {
  return (
    <div
      className={\`relative flex items-center justify-center select-none \${className}\`}
      style={{ width: size, height: size * 1.15 }}
    >
      {/* Exact Original Butterfly SVG - Razor Sharp, Static, Monochrome */}
      <svg
        viewBox="0 0 1104 1380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="geometricPrecision"
        textRendering="geometricPrecision"
        className="w-full h-full drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]"
      >
        <g strokeWidth="0">
` + paths.map((p) => {
  return `          <path
            d="${p.d}"
            fill="${p.color}"
            opacity="${p.opacity}"
          />`;
}).join('\n') + `
        </g>
      </svg>
    </div>
  );
};
`;

fs.writeFileSync('D:/Xeno-Inference/frontend/src/components/ButterflySvg.tsx', componentCode, 'utf8');
console.log('ButterflySvg.tsx written with razor-sharp static monochrome vector design!');