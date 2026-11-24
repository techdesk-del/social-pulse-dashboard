const fs = require('fs');

async function test() {
  const res = await fetch('https://www.instagram.com/urbangaon_official/', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
  });
  const html = await res.text();
  const matches = html.match(/edge_followed_by[^\}]+/g) || html.match(/followers[^\}]+/g) || [];
  console.log('Followers matches:', matches.slice(0, 5));
  
  // Search for urbangaon in html
  const idx = html.indexOf('urbangaon');
  console.log('urbangaon in html index:', idx);
  if (idx !== -1) {
    console.log('Snippet around urbangaon:', html.substring(idx - 100, idx + 300));
  }
}
test();
