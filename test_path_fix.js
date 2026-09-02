const fs = require('fs');
const rawSvg = fs.readFileSync('C:/Users/harsh/Downloads/Untitled.svg', 'utf8');

const pathMatches = rawSvg.match(/<path\s+[^>]*>/g) || [];

pathMatches.forEach((p, idx) => {
  let d = (p.match(/d="([^"]+)"/) || [null, ''])[1];
  const fill = (p.match(/fill="([^"]+)"/) || [null, ''])[1];
  if (idx === 0) {
    d = d.replace(/^M184 690v460h736V230H184zm594-359\.2/, 'M778 330.8');
  }
  console.log(`Path ${idx} (fill: "${fill}") starts: ${d.slice(0, 50)}`);
});