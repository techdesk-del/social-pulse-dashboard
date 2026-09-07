async function test() {
  const slugs = ['urbangaonofficial', 'urbangaon', 'UrbanGaonJaipur', 'UrbanGaonOfficial'];
  for (const slug of slugs) {
    const res = await fetch(`https://www.facebook.com/${slug}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });
    const html = await res.text();
    const title = html.match(/<title>([^<]+)<\/title>/i);
    const metaDesc = html.match(/<meta name="description" content="([^"]+)"/i) || html.match(/content="([^"]*likes[^"]*)"/i);
    console.log(slug, 'Status:', res.status, 'Title:', title ? title[1] : 'None', 'Desc:', metaDesc ? metaDesc[1] : 'None');
  }
}
test();
