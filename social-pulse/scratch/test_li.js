async function test() {
  const res = await fetch('https://www.linkedin.com/company/urbangaon/', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    }
  });
  console.log('LinkedIn status:', res.status, 'redirected:', res.redirected, 'url:', res.url);
}
test();
