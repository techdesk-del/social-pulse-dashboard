const fs = require('fs');
const zlib = require('zlib');

// read zip central directory
const buffer = fs.readFileSync('nas_social_pulse.zip');
// find filenames in zip local headers
const filenames = [];
let i = 0;
while (i < buffer.length - 4) {
  if (buffer[i] === 0x50 && buffer[i+1] === 0x4b && buffer[i+2] === 0x03 && buffer[i+3] === 0x04) {
    const fnLen = buffer.readUInt16LE(i + 26);
    const extraLen = buffer.readUInt16LE(i + 28);
    const fn = buffer.toString('utf8', i + 30, i + 30 + fnLen);
    filenames.push(fn);
    i += 30 + fnLen + extraLen;
  } else {
    i++;
  }
}

console.log('Total files in zip:', filenames.length);
console.log('Has .next in zip:', filenames.some(f => f.startsWith('.next')));
console.log('Has node_modules/next in zip:', filenames.some(f => f.includes('node_modules/next') || f.includes('node_modules\\next')));
console.log('First 20 filenames:');
console.log(filenames.slice(0, 20));
