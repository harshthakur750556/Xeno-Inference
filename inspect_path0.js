const fs = require('fs');
const svg = fs.readFileSync('C:/Users/harsh/Downloads/Untitled.svg', 'utf8');

const p0 = (svg.match(/<path d="([^"]+)"/) || [null, ''])[1];
console.log("Path 0 start:", p0.slice(0, 100));