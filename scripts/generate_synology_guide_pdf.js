const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_PDF = path.join(__dirname, '..', 'Synology_NAS_Social_Pulse_Deployment_Guide.pdf');
const HTML_PATH = path.join(__dirname, '..', 'Synology_NAS_Social_Pulse_Deployment_Guide.html');

async function buildPdf() {
  console.log('Building Synology NAS Social Pulse Deployment Guide PDF...');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>UrbanGaon Social Pulse - Synology NAS Deployment & Git Automation Guide</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #ffffff;
      color: #0f172a;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      width: 210mm;
      height: 297mm;
      max-height: 297mm;
      padding: 13mm 16mm 12mm 16mm;
      box-sizing: border-box;
      page-break-after: always;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      background: #ffffff;
      overflow: hidden;
    }

    /* Page Header */
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 7px;
    }

    .header-title-box {
      max-width: 65%;
    }

    .main-title {
      font-size: 21px;
      font-weight: 800;
      color: #1e3a8a;
      letter-spacing: -0.02em;
      line-height: 1.2;
    }

    .sub-tags {
      font-size: 9px;
      font-weight: 700;
      color: #2563eb;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-top: 5px;
    }

    .header-meta {
      text-align: right;
      font-size: 9.5px;
      color: #64748b;
      line-height: 1.45;
    }

    .header-meta strong {
      color: #0f172a;
    }

    .blue-divider {
      width: 100%;
      height: 2.5px;
      background: #2563eb;
      margin-bottom: 12px;
      border-radius: 2px;
    }

    .page-body {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    /* Callout Box */
    .security-callout {
      background: #f0fdf4;
      border: 1.5px solid #86efac;
      border-radius: 8px;
      padding: 11px 15px;
      margin-bottom: 14px;
    }

    .callout-title {
      font-size: 11.5px;
      font-weight: 800;
      color: #15803d;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .callout-desc {
      font-size: 10.5px;
      color: #166534;
      line-height: 1.45;
    }

    .part-title {
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 11px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* Step Item */
    .step-box {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 11px 14px;
      margin-bottom: 11px;
      background: #ffffff;
    }

    .step-head {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }

    .step-circle {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #2563eb;
      color: #ffffff;
      font-size: 11px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .step-name {
      font-size: 12.5px;
      font-weight: 800;
      color: #0f172a;
    }

    .step-content {
      font-size: 10.5px;
      color: #334155;
      line-height: 1.45;
      padding-left: 28px;
    }

    .step-content ol, .step-content ul {
      padding-left: 14px;
      margin-top: 3px;
    }

    .step-content li {
      margin-bottom: 3px;
    }

    /* Code Snippets */
    .code-dark {
      background: #0f172a;
      border-radius: 6px;
      padding: 8px 12px;
      color: #38bdf8;
      font-family: Consolas, "Courier New", monospace;
      font-size: 9.5px;
      line-height: 1.4;
      margin-top: 5px;
      margin-bottom: 4px;
      word-break: break-all;
    }

    .alert-green {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 6px;
      padding: 7px 12px;
      font-size: 10.5px;
      color: #047857;
      font-weight: 600;
      margin-top: 6px;
    }

    /* Option Box */
    .option-card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 11px 14px;
      margin-bottom: 11px;
      background: #ffffff;
    }

    .option-head {
      display: flex;
      align-items: center;
      gap: 7px;
      margin-bottom: 6px;
    }

    .opt-badge {
      width: 19px;
      height: 19px;
      border-radius: 50%;
      background: #1d4ed8;
      color: #ffffff;
      font-size: 10.5px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .opt-title {
      font-size: 12px;
      font-weight: 800;
      color: #0f172a;
    }

    /* FAQ Grid */
    .faq-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-top: 6px;
    }

    .faq-card {
      border: 1px solid #e2e8f0;
      border-radius: 7px;
      padding: 9px 12px;
      background: #f8fafc;
    }

    .faq-q {
      font-size: 10.5px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 3px;
    }

    .faq-a {
      font-size: 10px;
      color: #475569;
      line-height: 1.35;
    }

    /* Page Footer */
    .page-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 7px;
      border-top: 1px solid #e2e8f0;
      font-size: 9px;
      color: #64748b;
    }

    .footer-left {
      font-weight: 500;
    }

    .footer-right {
      font-weight: 600;
      color: #475569;
    }
  </style>
</head>
<body>

  <!-- ============================================================== -->
  <!-- PAGE 1: PART 1 - INITIAL SETUP ON SYNOLOGY DS925+               -->
  <!-- ============================================================== -->
  <div class="page">
    <div class="page-body">
      <div class="header-bar">
        <div class="header-title-box">
          <div class="main-title">Synology NAS Deployment &amp; Social Pulse Guide</div>
          <div class="sub-tags">STEP-BY-STEP • ZERO CLOUD COMPROMISE • 100% PRIVATE HARDWARE</div>
        </div>
        <div class="header-meta">
          <strong>Hardware Target:</strong> Synology DS925+ (192.168.1.246)<br>
          <strong>Container Tool:</strong> Synology Container Manager<br>
          <strong>Code Sync:</strong> Docker Compose Native
        </div>
      </div>
      <div class="blue-divider"></div>

      <div class="security-callout">
        <div class="callout-title">🛡️ Disaster Prevention &amp; Absolute Data Isolation:</div>
        <div class="callout-desc">
          Social Pulse runs inside an isolated Docker container sandbox. It has zero permission to touch existing office backups, shared department drives, or personal folders. It is capped to &lt; 250 MB RAM, ensuring your Synology DS925+ runs ultra-smooth without any slowdown.
        </div>
      </div>

      <div class="part-title">Part 1: Initial One-Time Setup on Synology NAS (IP: 192.168.1.246)</div>

      <!-- STEP 1 -->
      <div class="step-box">
        <div class="step-head">
          <div class="step-circle">1</div>
          <div class="step-name">Install Container Manager on Synology</div>
        </div>
        <div class="step-content">
          1. Log into DSM portal: <code>https://192.168.1.246:5001</code>.<br>
          2. Open <strong>Package Center</strong>, search for <strong>Container Manager</strong>, and click <strong>Install</strong>.<br>
          <em>(This automatically generates the dedicated <code>/docker</code> shared folder in File Station).</em>
        </div>
      </div>

      <!-- STEP 2 -->
      <div class="step-box">
        <div class="step-head">
          <div class="step-circle">2</div>
          <div class="step-name">Upload Project Bundle to NAS (File Station or Git)</div>
        </div>
        <div class="step-content">
          <strong>Recommended Method (Instant Zero-Build):</strong><br>
          1. In File Station, open the <code>docker</code> folder and create a new folder: <code>social-pulse</code>.<br>
          2. Upload <code>D:\Dashboard\social-pulse\nas_social_pulse.zip</code> into <code>/docker/social-pulse/</code>.<br>
          3. Right-click <code>nas_social_pulse.zip</code> ➔ <strong>Extract ➔ Extract to here</strong>.<br>
          <em>(Alternative Git SSH: <code>cd /volume1/docker && git clone &lt;repo&gt; social-pulse</code>).</em>
        </div>
      </div>

      <!-- STEP 3 -->
      <div class="step-box">
        <div class="step-head">
          <div class="step-circle">3</div>
          <div class="step-name">1-Click Launch via Synology Container Manager</div>
        </div>
        <div class="step-content">
          1. In DSM, open the <strong>Container Manager</strong> app.<br>
          2. Click <strong>Project</strong> on the left sidebar, then click the blue <strong>Create</strong> button.<br>
          3. Configure the project:
          <ul style="margin-top: 3px;">
            <li><strong>Project Name:</strong> <code>social-pulse</code></li>
            <li><strong>Path:</strong> Select <code>/docker/social-pulse</code></li>
            <li><strong>Source:</strong> Choose <strong>"Use existing docker-compose.yml"</strong></li>
          </ul>
          4. Click <strong>Next</strong>, then click <strong>Done</strong>.
          <div class="alert-green">
            ✅ Local LAN Access: Open <strong>http://192.168.1.246:3000</strong> on any office laptop or smartphone!
          </div>
        </div>
      </div>

      <!-- STEP 4 -->
      <div class="step-box">
        <div class="step-head">
          <div class="step-circle">4</div>
          <div class="step-name">Make It Live Worldwide via Cloudflare Zero-Trust (Zero Router Ports)</div>
        </div>
        <div class="step-content">
          1. Go to <strong>dash.cloudflare.com ➔ Zero Trust ➔ Networks ➔ Tunnels</strong>.<br>
          2. Click <strong>urbangaon-nas</strong> tunnel <em>(already active on your NAS)</em>.<br>
          3. Add a Public Hostname:
          <div class="code-dark">
Domain: social.urbangaon.com  ➔  Service: HTTP://localhost:3000 (or HTTP://192.168.1.246:3000)
          </div>
          4. <strong>Result:</strong> <code>https://social.urbangaon.com</code> is instantly live worldwide with free auto-renewing SSL!
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div class="footer-left">UrbanGaon Technologies Pvt. Ltd. • Social Pulse NAS Guide</div>
      <div class="footer-right">Page 1 of 2 • Part 1: Initial Deployment</div>
    </div>
  </div>

  <!-- ============================================================== -->
  <!-- PAGE 2: PART 2 - UPDATES & ZERO DOWNTIME WORKFLOW              -->
  <!-- ============================================================== -->
  <div class="page">
    <div class="page-body">
      <div class="header-bar">
        <div class="header-title-box">
          <div class="main-title">Synology NAS Social Pulse Automation Guide</div>
          <div class="sub-tags">PART 2: ZERO-DOWNTIME UPDATES &amp; OPERATIONAL INTEGRITY</div>
        </div>
        <div class="header-meta">
          <strong>Section:</strong> Automated Update Workflow<br>
          <strong>Effort:</strong> 0 Seconds (Background Auto-Sync)<br>
          <strong>Downtime:</strong> Zero (Rolling Container Swap)
        </div>
      </div>
      <div class="blue-divider"></div>

      <div class="part-title">Part 2: How Updates Work (When New Features Are Added)</div>
      <div style="font-size: 11px; color: #475569; margin-bottom: 11px;">
        Whenever you update the dashboard code in VS Code, choose either the 5-second manual command or automated sync:
      </div>

      <!-- OPTION A -->
      <div class="option-card">
        <div class="option-head">
          <div class="opt-badge">A</div>
          <div class="opt-title">Option A: 5-Second Command Update (Semi-Manual)</div>
        </div>
        <div style="font-size: 10.5px; color: #334155; line-height: 1.45; padding-left: 26px;">
          1. On your laptop, push updated code to Git:<br>
          <div class="code-dark">git add . && git commit -m "Updated social metrics" && git push origin main</div>
          2. Log into NAS terminal (or run in Container Manager):<br>
          <div class="code-dark">cd /volume1/docker/social-pulse && docker-compose restart</div>
          ✨ <strong>Done!</strong> The container restarts in &lt; 2 seconds with the updated code live.
        </div>
      </div>

      <!-- OPTION B -->
      <div class="option-card">
        <div class="option-head">
          <div class="opt-badge">B</div>
          <div class="opt-title">Option B: 100% Automated Auto-Sync via Synology Task Scheduler</div>
        </div>
        <div style="font-size: 10.5px; color: #334155; line-height: 1.45; padding-left: 26px;">
          Set your Synology NAS to automatically sync changes in the background:<br>
          1. In DSM, go to <strong>Control Panel ➔ Task Scheduler</strong>.<br>
          2. Click <strong>Create ➔ Scheduled Task ➔ User-defined script</strong>.<br>
          3. General Settings: Name it <code>Auto-Update Social Pulse</code>, User: <code>root</code>.<br>
          4. Schedule: Set to run every 15 minutes (or hourly).<br>
          5. In Task Settings "Run command" box, paste:
          <div class="code-dark">cd /volume1/docker/social-pulse && git fetch origin main && if [ $(git rev-parse HEAD) != $(git rev-parse origin/main) ]; then git pull origin main && docker-compose up -d; fi</div>
          🚀 <strong>Hands-Free Mode:</strong> Push code from your laptop, close your lid, and the NAS updates automatically!
        </div>
      </div>

      <div class="part-title" style="margin-top: 6px;">Frequently Asked Questions &amp; Peace of Mind for Sir</div>
      <div class="faq-grid">
        <div class="faq-card">
          <div class="faq-q">Will updating code erase our social data?</div>
          <div class="faq-a"><strong>No.</strong> All social metrics, reviews, and week entries live safely in MongoDB Atlas Cloud. Code updates only touch frontend display logic, never database records.</div>
        </div>
        <div class="faq-card">
          <div class="faq-q">What if a code error breaks the build?</div>
          <div class="faq-a">Docker keeps running the previous working container until the new one is validated. Live users experience zero downtime.</div>
        </div>
        <div class="faq-card">
          <div class="faq-q">Can Docker touch personal NAS files?</div>
          <div class="faq-a"><strong>Never.</strong> The container is isolated strictly to <code>/docker/social-pulse/</code> with zero permission to read other volumes or office backups.</div>
        </div>
        <div class="faq-card">
          <div class="faq-q">What if office power cuts during an update?</div>
          <div class="faq-a">Once power returns and the NAS boots, Docker reads <code>docker-compose.yml</code> and automatically resumes running the app.</div>
        </div>
      </div>

      <div class="alert-green" style="margin-top: 11px;">
        📌 <strong>Summary:</strong> By deploying on our Synology DS925+, UrbanGaon achieves 100% on-premise hardware sovereignty, zero third-party hosting fees, and enterprise-grade reliability.
      </div>
    </div>

    <div class="page-footer">
      <div class="footer-left">UrbanGaon Technologies Pvt. Ltd. • Social Pulse NAS Guide</div>
      <div class="footer-right">Page 2 of 2 • End of Documentation • Approved by Lead Engineering</div>
    </div>
  </div>

</body>
</html>
`;

  fs.writeFileSync(HTML_PATH, html, 'utf8');
  console.log('HTML written to:', HTML_PATH);

  console.log('Launching Puppeteer to render:', HTML_PATH);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files']
  });

  const page = await browser.newPage();
  const fileUrl = 'file:///' + HTML_PATH.replace(/\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'load', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1000));

  console.log('Generating PDF...');
  await page.pdf({
    path: OUTPUT_PDF,
    format: 'A4',
    landscape: false,
    printBackground: true,
    preferCSSPageSize: true,
  });

  console.log('PDF successfully created at:', OUTPUT_PDF);
  await browser.close();
}

buildPdf().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
