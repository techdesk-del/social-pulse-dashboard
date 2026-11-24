const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'generate_flow_pdf.dark.js.bak');
let code = fs.readFileSync(srcPath, 'utf8');

// 1. Replace CSS Style Block
const oldStyleRegex = /<style>([\s\S]*?)<\/style>/;

const newStyle = `<style>
    @page {
      size: A4 landscape;
      margin: 0;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      width: 297mm;
      height: 210mm;
      page-break-after: always;
      position: relative;
      overflow: hidden;
      padding: 13mm 16mm 11mm 16mm;
      display: flex;
      flex-direction: column;
      background: radial-gradient(circle at 10% 10%, rgba(37, 99, 235, 0.04) 0%, transparent 50%),
                  radial-gradient(circle at 90% 90%, rgba(168, 85, 247, 0.04) 0%, transparent 50%),
                  #ffffff;
    }

    /* Page Header */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e2e8f0;
    }
    .page-title-wrap {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .badge-category {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-weight: 700;
      color: #0284c7;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .badge-category::before {
      content: '';
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #0284c7;
      box-shadow: 0 0 6px rgba(2, 132, 199, 0.4);
    }
    .page-title {
      font-size: 19px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
    }
    .page-subtitle {
      font-size: 11px;
      color: #475569;
      max-width: 720px;
      line-height: 1.4;
    }
    .page-meta {
      text-align: right;
      font-family: Consolas, 'Courier New', monospace;
      font-size: 10px;
      color: #64748b;
    }
    .page-num {
      font-size: 13px;
      font-weight: 700;
      color: #0284c7;
      margin-bottom: 2px;
    }

    /* Content Area */
    .content-grid {
      flex: 1;
      display: grid;
      gap: 14px;
      align-items: stretch;
      min-height: 0;
    }

    .grid-2col {
      grid-template-columns: 1.15fr 0.85fr;
    }

    /* Visual Screenshot Frame */
    .screenshot-frame {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 10px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 20px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(15, 23, 42, 0.04);
      position: relative;
      overflow: hidden;
    }

    .frame-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 4px 6px 8px 6px;
      border-bottom: 1px solid #f1f5f9;
      margin-bottom: 8px;
      font-size: 10px;
      font-weight: 600;
      color: #475569;
    }
    .window-dots {
      display: flex;
      gap: 5px;
    }
    .window-dots span {
      width: 7px;
      height: 7px;
      border-radius: 50%;
    }
    .dot-red { background: #ef4444; }
    .dot-yellow { background: #f59e0b; }
    .dot-green { background: #10b981; }

    .screenshot-img-wrap {
      flex: 1;
      border-radius: 6px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #090d16;
      border: 1px solid #e2e8f0;
      position: relative;
    }

    .screenshot-img-wrap img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }

    /* Flow Cards Column */
    .flow-steps-col {
      display: flex;
      flex-direction: column;
      gap: 8px;
      justify-content: space-between;
    }

    .step-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-left: 3.5px solid #0284c7;
      border-radius: 8px;
      padding: 8px 11px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);
    }

    .step-card.purple { border-left-color: #9333ea; }
    .step-card.emerald { border-left-color: #059669; }
    .step-card.amber { border-left-color: #d97706; }
    .step-card.rose { border-left-color: #e11d48; }

    .step-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .step-badge {
      width: 20px;
      height: 20px;
      border-radius: 5px;
      background: #0284c7;
      color: #ffffff;
      font-size: 11px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .step-card.purple .step-badge { background: #9333ea; }
    .step-card.emerald .step-badge { background: #059669; }
    .step-card.amber .step-badge { background: #d97706; }
    .step-card.rose .step-badge { background: #e11d48; }

    .step-title {
      font-size: 11.5px;
      font-weight: 700;
      color: #0f172a;
    }

    .step-action-tag {
      margin-left: auto;
      font-family: Consolas, monospace;
      font-size: 9px;
      padding: 2px 6px;
      border-radius: 4px;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      color: #475569;
    }

    .step-desc {
      font-size: 10px;
      color: #334155;
      line-height: 1.4;
    }

    .step-desc code {
      background: #f1f5f9;
      color: #0f172a;
      padding: 1px 4px;
      border-radius: 3px;
      border: 1px solid #e2e8f0;
      font-size: 9px;
    }

    .step-outcome {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 9.5px;
      color: #0369a1;
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      padding: 3px 6px;
      border-radius: 4px;
      font-family: Consolas, monospace;
    }
    .step-card.emerald .step-outcome { color: #047857; background: #ecfdf5; border: 1px solid #a7f3d0; }
    .step-card.purple .step-outcome { color: #7e22ce; background: #faf5ff; border: 1px solid #e9d5ff; }
    .step-card.amber .step-outcome { color: #b45309; background: #fffbeb; border: 1px solid #fde68a; }
    .step-card.rose .step-outcome { color: #be123c; background: #fff1f2; border: 1px solid #fecdd3; }

    /* Flow Arrow */
    .flow-arrow-down {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
      font-size: 11px;
      margin: -3px 0;
    }

    /* Page Footer */
    .page-footer {
      margin-top: 8px;
      padding-top: 6px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9px;
      color: #64748b;
    }
    .footer-brand {
      font-weight: 700;
      color: #334155;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .footer-brand span {
      color: #0284c7;
    }

    /* Cover Page Specific */
    .cover-container {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      padding: 16mm 20mm;
    }
    .cover-top {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-box {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, #0284c7, #7c3aed);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 6px 18px rgba(2, 132, 199, 0.25);
    }
    .cover-main {
      margin: auto 0;
    }
    .cover-tag {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      font-weight: 700;
      color: #0284c7;
      margin-bottom: 12px;
    }
    .cover-title {
      font-size: 38px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.15;
      letter-spacing: -0.03em;
      margin-bottom: 14px;
    }
    .cover-desc {
      font-size: 14px;
      color: #475569;
      max-width: 760px;
      line-height: 1.6;
      margin-bottom: 26px;
    }
    .cover-stats-row {
      display: flex;
      gap: 16px;
    }
    .cover-stat-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 10px 16px;
      min-width: 140px;
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
    }
    .stat-val {
      font-size: 18px;
      font-weight: 800;
      color: #0284c7;
      margin-bottom: 2px;
    }
    .stat-lbl {
      font-size: 9px;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.05em;
    }
  </style>`;

code = code.replace(oldStyleRegex, newStyle);

// 2. Cover Page Header title color
code = code.replace(
  '<div style="font-size: 17px; font-weight: 800; color: #fff; letter-spacing: -0.01em;">Social Pulse</div>',
  '<div style="font-size: 17px; font-weight: 800; color: #0f172a; letter-spacing: -0.01em;">Social Pulse</div>'
);

// 3. Online status badge on Page 1
code = code.replace(
  '<div style="color: #10b981;">● Online</div>',
  '<div style="color: #059669; font-weight: 600;">● Online</div>'
);

// 4. Page 2 Active State and Verified text
code = code.replace(
  '<div style="color: #38bdf8;">Login Step</div>',
  '<div style="color: #0284c7; font-weight: 600;">Login Step</div>'
);
code = code.replace(
  '<div style="color: #10b981;">Session Verified</div>',
  '<div style="color: #059669; font-weight: 600;">Session Verified</div>'
);

// 5. Page 3 Global Header Controls
code = code.replace(
  '<div style="color: #38bdf8;">Controls Active</div>',
  '<div style="color: #0284c7; font-weight: 600;">Controls Active</div>'
);
code = code.replace(
  /background: rgba\(255,255,255,0\.04\); padding: 8px; border-radius: 6px; text-align: center;/g,
  'background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; text-align: center;'
);

// 6. Page 4 PulseBar & Week Selection
code = code.replace(
  '<div style="color: #10b981;">Active Week: Latest</div>',
  '<div style="color: #059669; font-weight: 600;">Active Week: Latest</div>'
);
code = code.replace(
  'style="box-shadow: 0 4px 16px rgba(0,0,0,0.5); border-radius: 8px; width: 90%;"',
  'style="box-shadow: 0 4px 16px rgba(15,23,42,0.06); border: 1px solid #e2e8f0; border-radius: 8px; width: 90%;"'
);
code = code.replace(
  'style="padding: 12px; font-size: 11px; color: #94a3b8; line-height: 1.5; background: rgba(0,0,0,0.2); border-radius: 6px; margin-top: 8px;"',
  'style="padding: 12px; font-size: 11px; color: #475569; line-height: 1.5; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; margin-top: 8px;"'
);
code = code.replace(
  '<strong style="color: #fff;">Mathematical Bar Height Algorithm:</strong>',
  '<strong style="color: #0f172a;">Mathematical Bar Height Algorithm:</strong>'
);
code = code.replace(
  '<code style="color: #38bdf8; font-family: Consolas, monospace;">h = minH (8px) + (i / max(weeks.length - 1, 1)) * (maxH (30px) - minH - 4)</code>',
  '<code style="color: #0284c7; font-family: Consolas, monospace; background: #e0f2fe; padding: 1px 5px; border-radius: 3px;">h = minH (8px) + (i / max(weeks.length - 1, 1)) * (maxH (30px) - minH - 4)</code>'
);

// 7. Page 5 Overview Tab
code = code.replace(
  '<div style="color: #38bdf8;">Overview Active</div>',
  '<div style="color: #0284c7; font-weight: 600;">Overview Active</div>'
);

// 8. Page 10 Compare Tab
code = code.replace(
  '<div style="color: #38bdf8;">Compare Active</div>',
  '<div style="color: #0284c7; font-weight: 600;">Compare Active</div>'
);

// 9. Page 11 Data Modal
code = code.replace(
  '<div style="color: #38bdf8;">Form Active</div>',
  '<div style="color: #0284c7; font-weight: 600;">Form Active</div>'
);
code = code.replace(
  '<div style="color: #10b981;">Ready to Commit</div>',
  '<div style="color: #059669; font-weight: 600;">Ready to Commit</div>'
);

// 10. Page 12 PDF Export Flow
code = code.replace(
  '<div style="color: #10b981;">Vector jsPDF Engine</div>',
  '<div style="color: #059669; font-weight: 600;">Vector jsPDF Engine</div>'
);
code = code.replace(
  '<div class="screenshot-img-wrap" style="padding: 24px; flex-direction: column; gap: 16px;">',
  '<div class="screenshot-img-wrap" style="padding: 24px; flex-direction: column; gap: 16px; background: #f8fafc;">'
);
code = code.replace(
  'style="background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 16px; width: 100%;"',
  'style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; width: 100%; box-shadow: 0 1px 4px rgba(15,23,42,0.04);"'
);
code = code.replace(
  '<div style="font-size: 11px; font-weight: 700; color: #38bdf8; margin-bottom: 6px;">EXPORT TRIGGER BUTTON:</div>',
  '<div style="font-size: 11px; font-weight: 700; color: #0284c7; margin-bottom: 6px;">EXPORT TRIGGER BUTTON:</div>'
);
code = code.replace(
  'style="background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 8px; padding: 16px; width: 100%; font-family: Consolas, monospace; font-size: 10.5px; color: #94a3b8; line-height: 1.6;"',
  'style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; width: 100%; font-family: Consolas, monospace; font-size: 10.5px; color: #334155; line-height: 1.6; box-shadow: 0 1px 4px rgba(15,23,42,0.04);"'
);
code = code.replace(
  '<div style="color: #38bdf8; font-weight: 700; margin-bottom: 6px;">AUTOMATIC BROWSER DOWNLOAD:</div>',
  '<div style="color: #0284c7; font-weight: 700; margin-bottom: 6px;">AUTOMATIC BROWSER DOWNLOAD:</div>'
);
code = code.replace(
  '<span style="color: #fff;">UrbanGaon_Social_Pulse_Week_2025_W02.pdf</span>',
  '<span style="color: #0f172a; font-weight: 600;">UrbanGaon_Social_Pulse_Week_2025_W02.pdf</span>'
);

// 11. Page 13 Button Reference Directory
code = code.replace(
  'style="flex: 1; overflow: hidden; background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; padding: 10px;"',
  'style="flex: 1; overflow: hidden; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px; box-shadow: 0 2px 8px rgba(15,23,42,0.04);"'
);
code = code.replace(
  '<tr style="border-bottom: 2px solid rgba(255, 255, 255, 0.15); color: #38bdf8; font-family: Consolas, monospace;">',
  '<tr style="border-bottom: 2px solid #cbd5e1; color: #0284c7; background: #f8fafc; font-family: Consolas, monospace;">'
);
code = code.replace(
  /<tbody style="color: #cbd5e1; line-height: 1\.4;">/g,
  '<tbody style="color: #334155; line-height: 1.4;">'
);

// Replace table row border & background colors
code = code.replace(
  /border-bottom: 1px solid rgba\(255, 255, 255, 0\.05\); background: rgba\(255,255,255,0\.02\);/g,
  'border-bottom: 1px solid #e2e8f0; background: #f8fafc;'
);
code = code.replace(
  /border-bottom: 1px solid rgba\(255, 255, 255, 0\.05\);/g,
  'border-bottom: 1px solid #e2e8f0;'
);

// Table text colors
code = code.replace(/font-weight: 700; color: #fff;/g, 'font-weight: 700; color: #0f172a;');
code = code.replace(/font-family: Consolas, monospace; color: #38bdf8;/g, 'font-family: Consolas, monospace; color: #0284c7;');
code = code.replace(/font-weight: 700; color: #38bdf8;/g, 'font-weight: 700; color: #0284c7;');
code = code.replace(/font-weight: 700; color: #10b981;/g, 'font-weight: 700; color: #059669;');
code = code.replace(/font-family: Consolas, monospace; color: #10b981;/g, 'font-family: Consolas, monospace; color: #059669;');
code = code.replace(/font-weight: 700; color: #ef4444;/g, 'font-weight: 700; color: #dc2626;');
code = code.replace(/font-family: Consolas, monospace; color: #ef4444;/g, 'font-family: Consolas, monospace; color: #dc2626;');
code = code.replace(/font-weight: 700; color: #ff0000;/g, 'font-weight: 700; color: #dc2626;');
code = code.replace(/font-family: Consolas, monospace; color: #ff0000;/g, 'font-family: Consolas, monospace; color: #dc2626;');

code = code.replace(/<div style="color: #38bdf8;">Idle Form<\/div>/g, '<div style="color: #0284c7; font-weight: 600;">Idle Form</div>');
code = code.replace('style="box-shadow: 0 4px 20px rgba(0,0,0,0.4); border-radius: 8px;"', 'style="box-shadow: 0 4px 16px rgba(15,23,42,0.08); border: 1px solid #e2e8f0; border-radius: 8px;"');
code = code.replace(/<div style="color: #38bdf8;">Multi-Channel Matrix<\/div>/g, '<div style="color: #0284c7; font-weight: 600;">Multi-Channel Matrix</div>');
code = code.replace(/<div style="color: #38bdf8;">DataModal Open<\/div>/g, '<div style="color: #0284c7; font-weight: 600;">DataModal Open</div>');

code = code.replace('<div class="screenshot-img-wrap" style="padding: 18px;">', '<div class="screenshot-img-wrap" style="padding: 18px; background: #f8fafc;">');
code = code.replace('<div class="screenshot-img-wrap" style="padding: 24px;">', '<div class="screenshot-img-wrap" style="padding: 24px; background: #f8fafc;">');

const outPath = path.join(__dirname, 'generate_flow_pdf.js');
fs.writeFileSync(outPath, code, 'utf8');
console.log('generate_flow_pdf.js successfully updated with Light Mode styling.');
