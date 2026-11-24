const fs = require('fs');
const content = fs.readFileSync('scratch/generate_flow_pdf.js', 'utf8');

// find all occurrences of style="..."
const styleMatches = [...content.matchAll(/style="([^"]+)"/g)].map(m => m[1]);
console.log('Total inline style instances:', styleMatches.length);

const inlineSamples = new Set();
for (const s of styleMatches) {
  inlineSamples.add(s);
}
console.log('Unique inline style definitions:', inlineSamples.size);

// Print all unique inline styles
fs.writeFileSync('scratch/inline_styles.json', JSON.stringify(Array.from(inlineSamples), null, 2));

// Hex colors
const hexRegex = /#([0-9a-fA-F]{3,8})/g;
const colors = new Set();
let m;
while ((m = hexRegex.exec(content)) !== null) {
  colors.add(m[0].toLowerCase());
}
console.log('Hex colors:', Array.from(colors));

// RGBA colors
const rgbaRegex = /rgba\([^)]+\)/g;
const rgbas = new Set();
while ((m = rgbaRegex.exec(content)) !== null) {
  rgbas.add(m[0].toLowerCase());
}
console.log('RGBA colors:', Array.from(rgbas));
