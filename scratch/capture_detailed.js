const puppeteer = require('puppeteer-core');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.join(__dirname, 'screenshots');
const JWT_SECRET = 'social_pulse_super_secret_jwt_key_2025_prod';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 960, deviceScaleFactor: 2 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Set Auth Cookie
  const token = jwt.sign(
    { userId: 'admin123', email: 'social@urbangaon.com', name: 'UrbanGaon Social Team' },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
  await page.setCookie({
    name: 'social_pulse_token',
    value: token,
    domain: 'localhost',
    path: '/',
    httpOnly: true,
  });

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));

  // 1. Header close-up
  const headerEl = await page.$('.header-row');
  if (headerEl) {
    await headerEl.screenshot({ path: path.join(OUTPUT_DIR, '03_header_row.png') });
  }

  // 2. Buttons close-up
  const syncBtn = await page.$('#btn-sync-all-live');
  if (syncBtn) {
    await syncBtn.screenshot({ path: path.join(OUTPUT_DIR, 'btn_sync_all.png') });
  }
  const addBtn = await page.$('#btn-add-week');
  if (addBtn) {
    await addBtn.screenshot({ path: path.join(OUTPUT_DIR, 'btn_add_week.png') });
  }
  const pdfBtn = await page.$('#btn-export-pdf');
  if (pdfBtn) {
    await pdfBtn.screenshot({ path: path.join(OUTPUT_DIR, 'btn_export_pdf.png') });
  }

  // 3. Google tab details
  await page.click('#tab-google');
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '10_tab_google_full.png'), fullPage: false });

  // 4. YouTube tab details
  await page.click('#tab-youtube');
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '11_tab_youtube_full.png'), fullPage: false });

  // 5. Open DataModal and capture different tabs inside DataModal
  await page.click('#btn-add-week');
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '13_modal_open.png') });

  // Switch to Add New Week in select
  await page.select('#form-week-select', '__new__');
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '14_modal_new_week_dates.png') });

  // Close modal
  await page.click('.modal-close');
  await new Promise(r => setTimeout(r, 500));

  console.log('Detailed capture complete!');
  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
