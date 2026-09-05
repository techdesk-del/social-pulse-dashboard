// scripts/generateCeoPdf.js - Executive-Grade Publication PDF Generator for CEO Brief
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const mdPath = path.join(__dirname, '../CEO_EXECUTIVE_PRESENTATION.md');
const pdfPath = path.join(__dirname, '../CEO_EXECUTIVE_PRESENTATION.pdf');

function cleanText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/★/g, '*')
    .replace(/•/g, '-')
    .replace(/[^\x00-\x7F]/g, '');
}

function generateCeoPdf() {
  console.log('Generating executive-grade CEO Presentation PDF...');
  const mdContent = fs.readFileSync(mdPath, 'utf8');
  const lines = mdContent.split('\n');

  const doc = new PDFDocument({
    margins: { top: 46, bottom: 46, left: 46, right: 46 },
    size: 'A4',
    bufferPages: true
  });

  const writeStream = fs.createWriteStream(pdfPath);
  doc.pipe(writeStream);

  // Executive Color Palette
  const PRIMARY_NAVY = '#0F172A';   // Deep Slate Navy
  const SECONDARY_BLUE = '#1E3A8A'; // Corporate Royal Navy
  const ACCENT_GOLD = '#D97706';    // Warm Executive Gold
  const ACCENT_GREEN = '#059669';   // Positive Green
  const TEXT_MAIN = '#1E293B';      // Premium Slate Charcoal Body
  const TEXT_MUTED = '#64748B';     // Neutral Grey
  const BG_CARD = '#F8FAFC';        // Soft Tint Background
  const BORDER_COLOR = '#E2E8F0';   // Crisp Table Border
  const PAGE_WIDTH = 503;           // 595.28 - 92 margins

  let inCodeBlock = false;
  let codeBlockLines = [];
  let inTable = false;
  let tableRows = [];

  function checkPageBreak(requiredHeight) {
    if (doc.y + requiredHeight > doc.page.height - 52) {
      doc.addPage();
      return true;
    }
    return false;
  }

  function flushCodeBlock() {
    if (codeBlockLines.length === 0) return;
    
    // Non-technical visual flowchart box
    const totalLines = codeBlockLines.length;
    const blockHeight = totalLines * 12 + 16;
    checkPageBreak(blockHeight + 10);

    const startY = doc.y;
    // Draw background card with subtle gold accent border
    doc.rect(46, startY, PAGE_WIDTH, blockHeight).fillAndStroke('#F8FAFC', '#CBD5E1');
    doc.rect(46, startY, 4, blockHeight).fill(ACCENT_GOLD);

    let lineY = startY + 9;
    for (const rawLine of codeBlockLines) {
      const line = cleanText(rawLine);
      const isHeader = line.includes('[ STEP');
      if (isHeader) {
        doc.fillColor(SECONDARY_BLUE).fontSize(8.5).font('Helvetica-Bold')
           .text(line, 58, lineY, { width: PAGE_WIDTH - 24 });
      } else if (line.includes('│') || line.includes('▼')) {
        doc.fillColor(ACCENT_GOLD).fontSize(8).font('Helvetica-Bold')
           .text(line, 58, lineY, { width: PAGE_WIDTH - 24, align: 'left' });
      } else {
        doc.fillColor(TEXT_MAIN).fontSize(8).font('Helvetica')
           .text(line, 58, lineY, { width: PAGE_WIDTH - 24 });
      }
      lineY += 12;
    }

    doc.y = startY + blockHeight + 10;
    codeBlockLines = [];
    inCodeBlock = false;
  }

  function flushTable() {
    if (tableRows.length === 0) return;

    // Filter out separator lines
    const validRows = tableRows.filter(r => !r.every(c => /^[:\s-]+$/.test(c)));
    if (validRows.length === 0) {
      tableRows = [];
      inTable = false;
      return;
    }

    const colCount = Math.max(...validRows.map(r => r.length));
    
    // Tailored column widths
    let colWidths = [];
    if (colCount === 4) {
      colWidths = [85, 125, 145, 148]; // Exactly 503
    } else if (colCount === 3) {
      colWidths = [120, 150, 233];
    } else if (colCount === 2) {
      colWidths = [160, 343];
    } else {
      const w = Math.floor(PAGE_WIDTH / colCount);
      colWidths = Array(colCount).fill(w);
      colWidths[colCount - 1] = PAGE_WIDTH - (w * (colCount - 1));
    }

    validRows.forEach((row, rIdx) => {
      const isHeader = rIdx === 0;
      
      // Calculate row height based on cell text content
      let maxCellHeight = 18;
      row.forEach((cell, cIdx) => {
        const cw = colWidths[cIdx] || 100;
        const cleanCell = cleanText(cell);
        const fontName = isHeader ? 'Helvetica-Bold' : 'Helvetica';
        const fontSize = isHeader ? 8 : 7.8;
        doc.fontSize(fontSize).font(fontName);
        const h = doc.heightOfString(cleanCell, { width: cw - 12 });
        if (h + 10 > maxCellHeight) {
          maxCellHeight = h + 10;
        }
      });

      checkPageBreak(maxCellHeight + 4);

      const curY = doc.y;

      // Draw row background
      if (isHeader) {
        doc.rect(46, curY, PAGE_WIDTH, maxCellHeight).fill(PRIMARY_NAVY);
      } else if (rIdx % 2 === 1) {
        doc.rect(46, curY, PAGE_WIDTH, maxCellHeight).fill('#F8FAFC');
      } else {
        doc.rect(46, curY, PAGE_WIDTH, maxCellHeight).fill('#FFFFFF');
      }

      // Draw cells and text
      let curX = 46;
      row.forEach((cell, cIdx) => {
        const cw = colWidths[cIdx] || 100;
        doc.rect(curX, curY, cw, maxCellHeight).stroke(BORDER_COLOR);

        const cleanCell = cleanText(cell);
        if (isHeader) {
          doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold')
             .text(cleanCell, curX + 6, curY + 5, { width: cw - 12, lineGap: 1.2 });
        } else {
          // Highlight first column or specific tags
          const isFirstCol = cIdx === 0;
          doc.fillColor(isFirstCol ? SECONDARY_BLUE : TEXT_MAIN)
             .fontSize(7.8)
             .font(isFirstCol ? 'Helvetica-Bold' : 'Helvetica')
             .text(cleanCell, curX + 6, curY + 5, { width: cw - 12, lineGap: 1.2 });
        }
        curX += cw;
      });

      doc.y = curY + maxCellHeight;
    });

    doc.moveDown(0.7);
    tableRows = [];
    inTable = false;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle code blocks (flowcharts)
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock();
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // Handle tables
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      inTable = true;
      const cells = line.split('|').slice(1, -1).map(c => c.trim());
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Horizontal divider
    if (line.trim() === '---') {
      doc.moveDown(0.35);
      doc.strokeColor(BORDER_COLOR).lineWidth(0.7).moveTo(46, doc.y).lineTo(46 + PAGE_WIDTH, doc.y).stroke();
      doc.moveDown(0.45);
      continue;
    }

    // H1 (Main Title / Cover Banner)
    if (line.startsWith('# ')) {
      const titleText = cleanText(line.replace('# ', ''));
      if (doc.y > 60) doc.addPage();

      // Top Executive Navy Card Banner
      const bannerY = doc.y;
      doc.rect(46, bannerY, PAGE_WIDTH, 42).fill(PRIMARY_NAVY);
      doc.rect(46, bannerY, 5, 42).fill(ACCENT_GOLD);

      doc.fillColor('#FFFFFF').fontSize(16).font('Helvetica-Bold')
         .text(titleText, 62, bannerY + 13, { width: PAGE_WIDTH - 30 });

      doc.y = bannerY + 50;
      continue;
    }

    // H2 (Major Document Sections)
    if (line.startsWith('## ')) {
      const h2Text = cleanText(line.replace('## ', ''));
      doc.moveDown(0.3);
      checkPageBreak(35);

      doc.fillColor(SECONDARY_BLUE).fontSize(12).font('Helvetica-Bold')
         .text(h2Text, 46, doc.y, { width: PAGE_WIDTH });
      
      // Subtle underline
      doc.moveDown(0.15);
      doc.strokeColor(ACCENT_GOLD).lineWidth(1.2).moveTo(46, doc.y).lineTo(90, doc.y).stroke();
      doc.moveDown(0.35);
      continue;
    }

    // H3 (Sub-sections)
    if (line.startsWith('### ')) {
      const h3Text = cleanText(line.replace('### ', ''));
      doc.moveDown(0.35);
      checkPageBreak(28);

      doc.fillColor(PRIMARY_NAVY).fontSize(10.5).font('Helvetica-Bold')
         .text(h3Text, 46, doc.y, { width: PAGE_WIDTH });
      doc.moveDown(0.2);
      continue;
    }

    // H4
    if (line.startsWith('#### ')) {
      const h4Text = cleanText(line.replace('#### ', ''));
      doc.moveDown(0.25);
      checkPageBreak(22);

      doc.fillColor(ACCENT_GOLD).fontSize(9.5).font('Helvetica-Bold')
         .text(h4Text, 46, doc.y, { width: PAGE_WIDTH });
      doc.moveDown(0.15);
      continue;
    }

    // Blockquote (Callouts and Executive Quotes)
    if (line.startsWith('> ')) {
      const quoteText = cleanText(line.replace(/^>\s*/, ''));
      doc.fontSize(8.5).font('Helvetica-Oblique');
      const textH = doc.heightOfString(quoteText, { width: PAGE_WIDTH - 28 });
      const cardH = textH + 12;

      checkPageBreak(cardH + 6);

      const qY = doc.y;
      doc.rect(46, qY, PAGE_WIDTH, cardH).fill(BG_CARD);
      doc.rect(46, qY, 4, cardH).fill(SECONDARY_BLUE);

      doc.fillColor(TEXT_MAIN).fontSize(8.5).font('Helvetica-Oblique')
         .text(quoteText, 58, qY + 6, { width: PAGE_WIDTH - 24, lineGap: 1.4 });

      doc.y = qY + cardH + 6;
      continue;
    }

    // Bullet points (- or *)
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const bulletText = cleanText(line.trim().substring(2));
      checkPageBreak(16);

      doc.fillColor(ACCENT_GOLD).fontSize(8).font('Helvetica-Bold')
         .text('>', 52, doc.y + 0.5, { width: 10, lineBreak: false });
      doc.fillColor(TEXT_MAIN).fontSize(8.5).font('Helvetica')
         .text(bulletText, 64, doc.y, { width: PAGE_WIDTH - 20, lineGap: 1.25 });
      doc.moveDown(0.14);
      continue;
    }

    // Numbered lists (1. 2. 3.)
    if (/^\d+\.\s/.test(line.trim())) {
      const numMatch = line.trim().match(/^(\d+\.)\s*(.*)/);
      if (numMatch) {
        checkPageBreak(18);
        doc.fillColor(SECONDARY_BLUE).fontSize(8.5).font('Helvetica-Bold')
           .text(numMatch[1], 48, doc.y, { width: 16, lineBreak: false });
        doc.fillColor(TEXT_MAIN).fontSize(8.5).font('Helvetica')
           .text(cleanText(numMatch[2]), 66, doc.y, { width: PAGE_WIDTH - 22, lineGap: 1.25 });
        doc.moveDown(0.14);
        continue;
      }
    }

    // Standard body paragraph
    if (line.trim().length > 0) {
      checkPageBreak(16);
      const cleanBody = cleanText(line);
      doc.fillColor(TEXT_MAIN).fontSize(8.5).font('Helvetica')
         .text(cleanBody, 46, doc.y, { width: PAGE_WIDTH, lineGap: 1.35 });
      doc.moveDown(0.18);
    }
  }

  // Flush any open blocks
  if (inTable) flushTable();
  if (inCodeBlock) flushCodeBlock();

  // Final Pass: Headers, Footers and Pagination
  const totalPages = doc.bufferedPageRange().count;
  for (let p = 0; p < totalPages; p++) {
    doc.switchToPage(p);
    const prevBottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;

    // Running top header on pages 2+
    if (p > 0) {
      doc.strokeColor(BORDER_COLOR).lineWidth(0.5).moveTo(46, 28).lineTo(46 + PAGE_WIDTH, 28).stroke();
      doc.fillColor(TEXT_MUTED).fontSize(7.5).font('Helvetica')
         .text('SOCIAL PULSE  |  EXECUTIVE PRESENTATION & BUSINESS OVERVIEW', 46, 17, { width: 350, align: 'left', lineBreak: false });
      doc.fillColor(ACCENT_GOLD).fontSize(7.5).font('Helvetica-Bold')
         .text('URBANGAON', 46 + PAGE_WIDTH - 100, 17, { width: 100, align: 'right', lineBreak: false });
    }

    // Running footer on all pages
    const footY = doc.page.height - 28;
    doc.strokeColor(BORDER_COLOR).lineWidth(0.5).moveTo(46, footY).lineTo(46 + PAGE_WIDTH, footY).stroke();
    doc.fillColor(TEXT_MUTED).fontSize(7.2).font('Helvetica')
       .text('Confidential - For Internal Executive & Board Review Only', 46, footY + 7, { width: 300, align: 'left', lineBreak: false });
    doc.fillColor(SECONDARY_BLUE).fontSize(7.5).font('Helvetica-Bold')
       .text(`Page ${p + 1} of ${totalPages}`, doc.page.width - 120, footY + 7, { width: 74, align: 'right', lineBreak: false });

    doc.page.margins.bottom = prevBottom;
  }

  doc.end();

  writeStream.on('finish', () => {
    console.log(`✅ Executive CEO Presentation PDF generated successfully: ${pdfPath}`);
    console.log(`📄 Total Clean Pages: ${totalPages}`);
  });
}

generateCeoPdf();
