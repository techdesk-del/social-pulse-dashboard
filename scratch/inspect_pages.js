const fs = require('fs');
const content = fs.readFileSync('scratch/generate_flow_pdf.js', 'utf8');

const pages = content.split(/<!-- =+ (PAGE [^=]+) =+ -->/);
for (let i = 1; i < pages.length; i += 2) {
  const name = pages[i];
  const body = pages[i+1];
  console.log('=== ' + name + ' (chars: ' + body.length + ') ===');
  const styleMatches = [...body.matchAll(/style="([^"]+)"/g)].map(m => m[1]);
  if (styleMatches.length > 0) {
    console.log('  Inline styles (' + styleMatches.length + '):');
    const uniqueStyles = [...new Set(styleMatches)];
    for (const s of uniqueStyles) {
      console.log('    ' + s);
    }
  }
}
