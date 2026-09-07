async function test() {
  const res = await fetch('https://www.linkedin.com/company/urbangaon/', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
  });
  const html = await res.text();
  const orgMatches = html.match(/urn:li:organization:(\d+)/g) || html.match(/organization\/(\d+)/g) || html.match(/"objectUrn":"urn:li:organization:(\d+)"/g) || [];
  console.log('Org matches:', orgMatches.slice(0, 10));
  
  const idMatches = html.match(/"id":(\d{6,10})/g) || [];
  console.log('ID matches:', idMatches.slice(0, 10));
}
test();
