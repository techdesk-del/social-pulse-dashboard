const puppeteer = require('puppeteer-core');
const path = require('path');

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1697, deviceScaleFactor: 1.5 });
  const htmlPath = path.join(process.cwd(), 'UrbanGaon_Social_Pulse_Hosting_Security_Brief.html');
  await page.goto('file:///' + htmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  
  const pages = await page.$$('.page');
  for (let i = 0; i < pages.length; i++) {
    await pages[i].screenshot({ path: path.join(process.cwd(), 'scratch', `sir_brief_p${i+1}.png`) });
  }
  await browser.close();
  console.log('Screenshots saved!');
}
capture().catch(console.error);
