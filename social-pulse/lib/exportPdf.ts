import type { WeekEntry } from './types';
import { PLATFORMS } from './constants';
import { fmtNum, formatWeekLabel, num, getTrend } from './utils';

// jspdf + autotable are CJS modules — import dynamically at runtime
export async function exportPDF(weeks: WeekEntry[], activeIndex: number): Promise<void> {
  // Dynamic import to avoid SSR issues
  const { default: jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentW = pageW - margin * 2;

  const activeWeek = weeks[activeIndex];
  const prevWeek = activeIndex > 0 ? weeks[activeIndex - 1] : null;
  const stamp = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // ── Palette ──
  const PRIMARY: [number, number, number] = [21, 88, 184];    // --li
  const TEXT: [number, number, number] = [12, 32, 56];        // --text
  const DIM: [number, number, number] = [62, 99, 130];        // --text-dim
  const SURFACE: [number, number, number] = [221, 235, 248];  // --bg
  const UP: [number, number, number] = [18, 127, 88];
  const DOWN: [number, number, number] = [194, 56, 56];
  const FLAT: [number, number, number] = [169, 119, 20];
  const LI: [number, number, number] = [21, 88, 184];
  const IG: [number, number, number] = [194, 47, 108];
  const FB: [number, number, number] = [90, 69, 201];
  const GOOG: [number, number, number] = [234, 67, 53];

  let y = margin;

  // ── Header band ──
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, pageW, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Social Pulse', margin, 12);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Weekly Performance Dashboard', margin, 19);
  doc.text(`Generated: ${stamp}`, pageW - margin, 19, { align: 'right' });
  doc.text(`Active Week: ${formatWeekLabel(activeWeek.weekId)}`, pageW - margin, 12, { align: 'right' });

  y = 34;

  // ── Cross-platform KPIs ──
  function trendCell(val: number, prev: number | null): string {
    if (prev === null) return fmtNum(val);
    const t = getTrend(val, prev);
    const pct = t.pct !== 0 ? ` (${t.pct > 0 ? '+' : ''}${t.pct.toFixed(1)}%)` : '';
    const arrow = t.dir === 'up' ? '▲' : t.dir === 'down' ? '▼' : '▬';
    return `${fmtNum(val)} ${arrow}${pct}`;
  }
  function trendColor(val: number, prev: number | null): [number, number, number] {
    if (prev === null) return TEXT;
    const t = getTrend(val, prev);
    return t.dir === 'up' ? UP : t.dir === 'down' ? DOWN : FLAT;
  }

  const googleDiscovery = num(activeWeek.google?.searchViews) + num(activeWeek.google?.mapsViews);
  const prevGoogleDiscovery = prevWeek ? num(prevWeek.google?.searchViews) + num(prevWeek.google?.mapsViews) : null;

  const totalReach = num(activeWeek.linkedin.impressions) + num(activeWeek.instagram.reach) + num(activeWeek.facebook.viewers) + googleDiscovery;
  const prevReach = prevWeek ? num(prevWeek.linkedin.impressions) + num(prevWeek.instagram.reach) + num(prevWeek.facebook.viewers) + (prevGoogleDiscovery ?? 0) : null;
  const totalEng = num(activeWeek.linkedin.reactions) + num(activeWeek.linkedin.comments) + num(activeWeek.linkedin.reposts) + num(activeWeek.instagram.contentInteractions) + num(activeWeek.facebook.contentInteractions) + num(activeWeek.google?.newReviews);
  const prevEng = prevWeek ? num(prevWeek.linkedin.reactions) + num(prevWeek.linkedin.comments) + num(prevWeek.linkedin.reposts) + num(prevWeek.instagram.contentInteractions) + num(prevWeek.facebook.contentInteractions) + num(prevWeek.google?.newReviews) : null;
  const totalFollows = num(activeWeek.linkedin.newFollowers) + num(activeWeek.instagram.follows) + num(activeWeek.facebook.follows) + num(activeWeek.google?.newReviews);
  const prevFollows = prevWeek ? num(prevWeek.linkedin.newFollowers) + num(prevWeek.instagram.follows) + num(prevWeek.facebook.follows) + num(prevWeek.google?.newReviews) : null;
  const totalClicks = num(activeWeek.instagram.linkClicks) + num(activeWeek.facebook.linkClicks) + num(activeWeek.google?.websiteClicks) + num(activeWeek.google?.callClicks);
  const prevClicks = prevWeek ? num(prevWeek.instagram.linkClicks) + num(prevWeek.facebook.linkClicks) + num(prevWeek.google?.websiteClicks) + num(prevWeek.google?.callClicks) : null;

  // Section title
  doc.setTextColor(...TEXT);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Cross-Platform KPI Summary', margin, y);
  y += 5;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Metric', 'This Week', 'Last Week', 'Change']],
    body: [
      ['Total Exposure (Social + Google Discovery)', fmtNum(totalReach), prevWeek ? fmtNum(prevReach!) : '—', trendCell(totalReach, prevReach)],
      ['Total Engagement & Reviews', fmtNum(totalEng), prevWeek ? fmtNum(prevEng!) : '—', trendCell(totalEng, prevEng)],
      ['New Audience Growth (Follows + Google Reviews)', fmtNum(totalFollows), prevWeek ? fmtNum(prevFollows!) : '—', trendCell(totalFollows, prevFollows)],
      ['Total Direct Actions & Clicks', fmtNum(totalClicks), prevWeek ? fmtNum(prevClicks!) : '—', trendCell(totalClicks, prevClicks)],
    ],
    headStyles: { fillColor: PRIMARY, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: TEXT },
    alternateRowStyles: { fillColor: SURFACE },
    columnStyles: { 0: { cellWidth: 80, fontStyle: 'bold' }, 3: { textColor: trendColor(totalReach, prevReach) } },
    styles: { cellPadding: 3, lineColor: [174, 203, 230], lineWidth: 0.2 },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // ── Per-platform sections ──
  const platforms: Array<{ key: 'linkedin' | 'instagram' | 'facebook' | 'google'; color: [number, number, number] }> = [
    { key: 'linkedin', color: LI },
    { key: 'instagram', color: IG },
    { key: 'facebook', color: FB },
    { key: 'google', color: GOOG },
  ];


  for (const { key, color } of platforms) {
    const cfg = PLATFORMS[key];
    const curr = activeWeek[key] as unknown as Record<string, number>;
    const prev = prevWeek ? prevWeek[key] as unknown as Record<string, number> : null;

    // Check page space
    if (y > 240) { doc.addPage(); y = margin; }

    // Platform header
    doc.setFillColor(...color);
    doc.roundedRect(margin, y, contentW, 7, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(cfg.label, margin + 4, y + 5);
    y += 10;

    const allFields = cfg.groups ? cfg.groups.flatMap((g) => g.fields) : cfg.metrics;
    const rows = allFields.map((f) => {
      const val = num(curr[f.key]);
      const pv = prev ? num(prev[f.key]) : null;
      return [f.label, fmtNum(val), pv !== null ? fmtNum(pv) : '—', trendCell(val, pv)];
    });

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Metric', 'This Week', 'Last Week', 'Change']],
      body: rows,
      headStyles: { fillColor: color, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
      bodyStyles: { fontSize: 8.5, textColor: TEXT },
      alternateRowStyles: { fillColor: SURFACE },
      columnStyles: { 0: { cellWidth: 70, fontStyle: 'bold' } },
      styles: { cellPadding: 2.5, lineColor: [174, 203, 230], lineWidth: 0.2 },
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  }

  // ── All weeks comparison ──
  if (weeks.length > 1) {
    if (y > 200) { doc.addPage(); y = margin; }

    doc.setTextColor(...TEXT);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('All Weeks — LinkedIn Overview', margin, y);
    y += 5;

    const weekHeaders = weeks.map((w) => formatWeekLabel(w.weekId));
    const liFields = PLATFORMS.linkedin.groups
      ? PLATFORMS.linkedin.groups.flatMap((g) => g.fields)
      : PLATFORMS.linkedin.metrics;
    const liRows = liFields.map((f) => {
      const cells = weeks.map((w) => fmtNum(num((w.linkedin as unknown as Record<string, number>)[f.key])));
      return [f.label, ...cells];
    });

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Metric', ...weekHeaders]],
      body: liRows,
      headStyles: { fillColor: LI, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: TEXT },
      alternateRowStyles: { fillColor: SURFACE },
      columnStyles: { 0: { cellWidth: 55, fontStyle: 'bold' } },
      styles: { cellPadding: 2, lineColor: [174, 203, 230], lineWidth: 0.2 },
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
  }

  // ── Footer ──
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFillColor(...SURFACE);
    doc.rect(0, pageH - 10, pageW, 10, 'F');
    doc.setTextColor(...DIM);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text('Social Pulse Dashboard — Confidential', margin, pageH - 4);
    doc.text(`Page ${p} of ${totalPages}`, pageW - margin, pageH - 4, { align: 'right' });
  }

  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`social-pulse-report-${dateStr}.pdf`);
}
