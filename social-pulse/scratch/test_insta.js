async function test() {
  try {
    const res = await fetch('https://www.instagram.com/urbangaon_official/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });
    const html = await res.text();
    console.log('Status:', res.status, 'HTML length:', html.length);
    
    // Check for followers/following in meta tags
    const descMatch = html.match(/content="([^"]*followers[^"]*)"/i) || html.match(/<meta property="og:description" content="([^"]+)"/i);
    console.log('Desc match:', descMatch ? descMatch[1] : 'None');
    
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    console.log('Title match:', titleMatch ? titleMatch[1] : 'None');
  } catch (err) {
    console.error(err);
  }
}
test();
