const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function preview() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 950, deviceScaleFactor: 1 });
  const fileUrl = 'file:///' + path.join(__dirname, 'flow_presentation.html').replace(/\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'load', timeout: 30000 });
  await new Promise(r => setTimeout(r, 600));

  const pages = await page.$$('.page');
  console.log('DOM .page count:', pages.length);
  if (pages[4]) await pages[4].screenshot({ path: path.join(__dirname, 'preview_page4.png') });
  console.log('Successfully saved preview screenshots.');
  await browser.close();
}

preview().catch(console.error);
