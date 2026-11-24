async function test() {
  const res = await fetch('https://www.linkedin.com/company/urbangaon/', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
  });
  const html = await res.text();
  const m = html.match(/(\d[\d,]*)\s+followers/i);
  console.log('Followers match:', m ? m[0] : 'None');
  const title = html.match(/<title>([^<]+)<\/title>/i);
  console.log('Title:', title ? title[1] : 'None');
  const metaDesc = html.match(/<meta name="description" content="([^"]+)"/i);
  console.log('Meta desc:', metaDesc ? metaDesc[1] : 'None');
}
test();
