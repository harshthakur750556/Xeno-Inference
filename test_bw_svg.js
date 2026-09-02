const fs = require('fs');
const svg = fs.readFileSync('C:/Users/harsh/Downloads/Untitled.svg', 'utf8');

// Path 0 starts with M184 690v460h736V230H184zm
// Let us test removing that bounding box
let cleaned = svg.replace('M184 690v460h736V230H184zm', 'M');

// Re-map default fills to crisp white/silver for black background
console.log("Cleaned SVG length:", cleaned.length);