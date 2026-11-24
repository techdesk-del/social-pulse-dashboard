const puppeteer = require('puppeteer-core');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.join(__dirname, 'screenshots');
const JWT_SECRET = 'social_pulse_super_secret_jwt_key_2025_prod';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function run() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();

  // 1. Screenshot Login Page
  console.log('1. Capturing Login Page...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(OUTPUT_DIR, '01_login_page.png') });

  // Type in credentials to show filled form state
  await page.type('#login-email', 'social@urbangaon.com');
  await page.type('#login-password', 'password123');
  await page.screenshot({ path: path.join(OUTPUT_DIR, '01b_login_filled.png') });

  // Set the auth token cookie
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

  // 2. Navigate to Dashboard
  console.log('2. Navigating to Dashboard...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000)); // wait for charts to animate

  // Capture Full Dashboard Overview
  console.log('Capturing Overview Tab...');
  await page.screenshot({ path: path.join(OUTPUT_DIR, '02_dashboard_overview_full.png'), fullPage: false });

  // Capture Header & Navigation Close-up
  const headerEl = await page.$('.header');
  if (headerEl) {
    await headerEl.screenshot({ path: path.join(OUTPUT_DIR, '03_header_controls.png') });
  }

  // Capture PulseBar Close-up
  const pulseBar = await page.$('.pulse-bar') || await page.$('.week-selector-container') || await page.$('[class*="pulse"]');
  if (pulseBar) {
    await pulseBar.screenshot({ path: path.join(OUTPUT_DIR, '04_pulse_week_bar.png') });
  }

  // Capture Tabs Bar Close-up
  const tabsBar = await page.$('.tabs') || await page.$('[role="tablist"]');
  if (tabsBar) {
    await tabsBar.screenshot({ path: path.join(OUTPUT_DIR, '05_tabs_navigation.png') });
  }

  // Capture KPI Cards Close-up
  const kpiSection = await page.$('.kpi-grid') || await page.$('.kpis');
  if (kpiSection) {
    await kpiSection.screenshot({ path: path.join(OUTPUT_DIR, '06_overview_kpi_cards.png') });
  }

  // 3. Tab: LinkedIn
  console.log('Capturing LinkedIn Tab...');
  const linkedinTabBtn = await page.$('button[id*="linkedin"]') || await page.$x("//button[contains(., 'LinkedIn')]");
  if (linkedinTabBtn) {
    const btn = Array.isArray(linkedinTabBtn) ? linkedinTabBtn[0] : linkedinTabBtn;
    await btn.click();
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '07_tab_linkedin.png') });
  }

  // 4. Tab: Instagram
  console.log('Capturing Instagram Tab...');
  const instaTabBtn = await page.$('button[id*="instagram"]') || await page.$x("//button[contains(., 'Instagram')]");
  if (instaTabBtn) {
    const btn = Array.isArray(instaTabBtn) ? instaTabBtn[0] : instaTabBtn;
    await btn.click();
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '08_tab_instagram.png') });
  }

  // 5. Tab: Facebook
  console.log('Capturing Facebook Tab...');
  const fbTabBtn = await page.$('button[id*="facebook"]') || await page.$x("//button[contains(., 'Facebook')]");
  if (fbTabBtn) {
    const btn = Array.isArray(fbTabBtn) ? fbTabBtn[0] : fbTabBtn;
    await btn.click();
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '09_tab_facebook.png') });
  }

  // 6. Tab: Google Reviews
  console.log('Capturing Google Reviews Tab...');
  const googleTabBtn = await page.$('button[id*="google"]') || await page.$x("//button[contains(., 'Google')]");
  if (googleTabBtn) {
    const btn = Array.isArray(googleTabBtn) ? googleTabBtn[0] : googleTabBtn;
    await btn.click();
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '10_tab_google_reviews.png') });
  }

  // 7. Tab: YouTube
  console.log('Capturing YouTube Tab...');
  const ytTabBtn = await page.$('button[id*="youtube"]') || await page.$x("//button[contains(., 'YouTube')]");
  if (ytTabBtn) {
    const btn = Array.isArray(ytTabBtn) ? ytTabBtn[0] : ytTabBtn;
    await btn.click();
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '11_tab_youtube.png') });
  }

  // 8. Tab: Compare
  console.log('Capturing Compare Tab...');
  const compareTabBtn = await page.$('button[id*="compare"]') || await page.$x("//button[contains(., 'Compare')]");
  if (compareTabBtn) {
    const btn = Array.isArray(compareTabBtn) ? compareTabBtn[0] : compareTabBtn;
    await btn.click();
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '12_tab_compare.png') });
  }

  // 9. Open DataModal (Add/Edit Week Data)
  console.log('Opening DataModal...');
  // Find "Add / Edit Week" or "Edit Data" or button with modal trigger
  const editBtn = await page.$('button.btn-primary') || await page.$('#btn-edit-data') || await page.$('button[title*="Edit"]');
  if (editBtn) {
    await editBtn.click();
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '13_modal_data_entry.png') });
  }

  console.log('All initial screenshots captured!');
  await browser.close();
}

run().catch(err => {
  console.error('Error during capture:', err);
  process.exit(1);
});
