const fs = require('fs');
const svg = fs.readFileSync('C:/Users/harsh/Downloads/Untitled.svg', 'utf8');

const paths = svg.match(/<path[^>]*>/g) || [];
paths.forEach((p, idx) => {
  const fill = (p.match(/fill="([^"]+)"/) || [null, 'default'])[1];
  console.log(`Path ${idx}: fill="${fill}", length=${p.length}`);
});