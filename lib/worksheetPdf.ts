// Generates a one-page A4 worksheet PDF from a week's practice data.
// Uses jsPDF only (no autoTable, no fonts beyond built-ins).

import { jsPDF } from 'jspdf';

interface Blank { answer: string; options: string[] }
interface Slot { icon: string; options: string[] }
interface Pair { code: string; output: string }

export interface PracticeData {
  week: number;
  fillBlanks: { template: string; blanks: Blank[]; expectedOutput: string; inputs?: string[] };
  matchPairs: Pair[];
  colourBoxes: { template: string; slots: Slot[] };
  drawIt: { code: string; correctOutput: string; options: string[] };
  challenge: { prompt: string; hint: string };
}

export interface LessonMeta {
  week: number;
  title: string;
  concept: string;
}

// Colour palette as RGB triplets so it renders decently in B&W too (via borders).
const PINK: [number, number, number]    = [255, 107, 157];
const PURPLE: [number, number, number]  = [157, 78, 221];
const NAVY: [number, number, number]    = [26, 26, 46];
const SUN: [number, number, number]     = [255, 217, 61];
const MINT: [number, number, number]    = [6, 214, 160];
const GREY_LIGHT: [number, number, number] = [230, 230, 240];
const GREY_MED: [number, number, number]   = [180, 180, 200];
const WHITE: [number, number, number]   = [255, 255, 255];

function rgb(doc: jsPDF, fn: 'setFillColor' | 'setDrawColor' | 'setTextColor', c: [number, number, number]) {
  doc[fn](c[0], c[1], c[2]);
}

function drawPixi(doc: jsPDF, x: number, y: number, size = 20) {
  // Simple purple-headed robot mascot built from primitives.
  rgb(doc, 'setFillColor', PURPLE);
  doc.roundedRect(x, y + 3, size, size * 0.85, 4, 4, 'F');
  // Antenna
  rgb(doc, 'setFillColor', SUN);
  doc.circle(x + size / 2, y, 1.4, 'F');
  rgb(doc, 'setDrawColor', PURPLE);
  doc.setLineWidth(0.8);
  doc.line(x + size / 2, y + 1.4, x + size / 2, y + 3);
  // Face plate
  doc.setFillColor(248, 240, 255);
  doc.roundedRect(x + 2, y + 5, size - 4, size * 0.5, 3, 3, 'F');
  // Eyes
  doc.setFillColor(26, 26, 46);
  doc.circle(x + size * 0.35, y + 10, 1, 'F');
  doc.circle(x + size * 0.65, y + 10, 1, 'F');
  // Smile
  doc.setDrawColor(26, 26, 46);
  doc.setLineWidth(0.6);
  // Approximate a smile with two lines
  doc.line(x + size * 0.35, y + 13, x + size * 0.5, y + 14.3);
  doc.line(x + size * 0.5, y + 14.3, x + size * 0.65, y + 13);
}

function sectionHeader(doc: jsPDF, x: number, y: number, w: number, n: number, title: string) {
  rgb(doc, 'setFillColor', PINK);
  doc.roundedRect(x, y, w, 7, 1.5, 1.5, 'F');
  rgb(doc, 'setTextColor', WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`${n}. ${title}`, x + 3, y + 5);
  rgb(doc, 'setTextColor', NAVY);
}

export function generateWorksheetPdf(p: PracticeData, lesson: LessonMeta): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210;
  const marginX = 12;
  const contentW = W - marginX * 2;
  let y = 12;

  // ── Header band ─────────────────────────────────────────
  rgb(doc, 'setFillColor', PURPLE);
  doc.roundedRect(marginX, y, contentW, 22, 3, 3, 'F');

  drawPixi(doc, marginX + 3, y + 1, 18);

  rgb(doc, 'setTextColor', WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Python Fun World', marginX + 26, y + 9);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Week ${lesson.week} · ${lesson.title}`, marginX + 26, y + 15);
  doc.text(`Concept: ${lesson.concept}`, marginX + 26, y + 20);

  // Name + date box top-right
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.4);
  doc.rect(W - marginX - 50, y + 2, 48, 9);
  doc.setFontSize(8);
  doc.text('Name:', W - marginX - 48, y + 6);
  doc.rect(W - marginX - 50, y + 12, 48, 9);
  doc.text('Date:', W - marginX - 48, y + 16);
  rgb(doc, 'setTextColor', NAVY);

  y += 26;

  // ── Section 1 — Trace the code ─────────────────────────
  sectionHeader(doc, marginX, y, contentW, 1, 'Trace the code');
  y += 9;
  rgb(doc, 'setTextColor', NAVY);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.text('Trace over the grey code with a pencil. Fill in each blank with your pick!', marginX, y);
  y += 5;

  // Render the fillBlanks template with blanks shown as rounded boxes.
  // Draw the code lines in Courier at ~12pt in light grey (traceable).
  const traceCode = p.fillBlanks.template.replace(/\{(\d+)\}/g, (_, n) => {
    const b = p.fillBlanks.blanks[parseInt(n, 10)];
    return ' ' + '_'.repeat(Math.max(6, b.answer.length + 2)) + ' ';
  });
  doc.setFillColor(255, 253, 245);
  rgb(doc, 'setDrawColor', GREY_MED);
  doc.setLineWidth(0.5);
  const codeLines = traceCode.split('\n');
  const codeH = codeLines.length * 7 + 6;
  doc.roundedRect(marginX, y, contentW, codeH, 2, 2, 'FD');
  doc.setFont('courier', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(170, 170, 185); // grey for tracing
  codeLines.forEach((line, i) => {
    doc.text(line, marginX + 4, y + 7 + i * 7);
  });
  rgb(doc, 'setTextColor', NAVY);

  // Options row below
  y += codeH + 3;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Pick from:', marginX, y + 3);
  let optX = marginX + 20;
  p.fillBlanks.blanks.forEach((b) => {
    b.options.forEach((o) => {
      const w = Math.max(14, doc.getTextWidth(o) + 6);
      doc.setDrawColor(157, 78, 221);
      doc.setLineWidth(0.4);
      doc.roundedRect(optX, y - 1, w, 6, 2, 2);
      doc.setFont('courier', 'normal');
      doc.setFontSize(9);
      doc.text(o, optX + 3, y + 3);
      doc.setFont('helvetica', 'normal');
      optX += w + 3;
    });
  });
  y += 8;

  // ── Section 2 — Match the output ───────────────────────
  sectionHeader(doc, marginX, y, contentW, 2, 'Match the output');
  y += 9;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.text('Draw a line from each code to the right output.', marginX, y);
  y += 4;

  const colW = contentW / 2 - 2;
  const rowH = 14;
  p.matchPairs.forEach((pair, i) => {
    // left card
    doc.setDrawColor(100, 100, 130);
    doc.setLineWidth(0.5);
    doc.roundedRect(marginX, y, colW - 4, rowH - 1, 2, 2);
    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    const lines = pair.code.split('\n').slice(0, 2);
    lines.forEach((ln, li) => doc.text(ln, marginX + 2, y + 4 + li * 3.5));
    // right card (shuffled visually — we show a different output per row so kid draws line)
    const shuffleIdx = (i + 1) % p.matchPairs.length;
    const rightOutput = p.matchPairs[shuffleIdx].output;
    doc.roundedRect(marginX + contentW / 2 + 2, y, colW - 4, rowH - 1, 2, 2);
    doc.setFont('courier', 'bold');
    doc.setFontSize(10);
    doc.text(rightOutput, marginX + contentW / 2 + 5, y + 8);
    y += rowH;
  });
  y += 2;

  // ── Section 3 — Fill the boxes ─────────────────────────
  sectionHeader(doc, marginX, y, contentW, 3, 'Fill the boxes');
  y += 9;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.text('Write a word or a number in each box. Pick any you like!', marginX, y);
  y += 4;

  // Draw boxes row
  const boxW = 36;
  const boxH = 12;
  const gap = 8;
  const totalW = p.colourBoxes.slots.length * boxW + (p.colourBoxes.slots.length - 1) * gap;
  let boxX = marginX + (contentW - totalW) / 2;
  p.colourBoxes.slots.forEach((s) => {
    doc.setDrawColor(230, 165, 48);
    doc.setLineWidth(0.8);
    doc.setFillColor(255, 248, 213);
    doc.roundedRect(boxX, y, boxW, boxH, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(s.icon === '📦' ? 'WORD' : s.icon === '🔢' ? 'NUM' : s.icon === '💬' ? 'TEXT' : '?',
             boxX + boxW / 2, y + 4, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(`one of: ${s.options.join(', ')}`, boxX + boxW / 2, y + 10, { align: 'center' });
    boxX += boxW + gap;
  });
  y += boxH + 3;
  // Code template shown below
  doc.setFont('courier', 'normal');
  doc.setFontSize(10);
  const cbTemplate = p.colourBoxes.template.replace(/\{\d+\}/g, '___');
  const cbLines = cbTemplate.split('\n');
  cbLines.forEach((ln, i) => doc.text(ln, marginX + 2, y + 4 + i * 4));
  y += cbLines.length * 4 + 4;

  // ── Section 4 — Draw what Pixi shows ───────────────────
  sectionHeader(doc, marginX, y, contentW, 4, 'Draw what Pixi shows');
  y += 9;
  doc.setFont('courier', 'bold');
  doc.setFontSize(10);
  const diLines = p.drawIt.code.split('\n');
  diLines.forEach((ln, i) => doc.text(ln, marginX, y + i * 4));
  const codeY = y + diLines.length * 4;
  // Big empty square
  const sqSize = 30;
  const sqX = marginX + contentW - sqSize - 2;
  const sqY = y - 2;
  doc.setDrawColor(157, 78, 221);
  doc.setLineWidth(0.8);
  doc.setLineDashPattern([2, 2], 0);
  doc.rect(sqX, sqY, sqSize, sqSize);
  doc.setLineDashPattern([], 0);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.text('Draw what Pixi', sqX + sqSize / 2, sqY + sqSize + 3.5, { align: 'center' });
  doc.text('will show →', sqX + sqSize / 2, sqY + sqSize + 7, { align: 'center' });
  y = Math.max(codeY, sqY + sqSize) + 8;

  // ── Section 5 — Challenge ──────────────────────────────
  sectionHeader(doc, marginX, y, contentW, 5, 'Challenge!');
  y += 9;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  // Wrap prompt text
  const wrapped = doc.splitTextToSize('✍️  ' + p.challenge.prompt, contentW - 4);
  doc.text(wrapped, marginX + 2, y + 4);
  y += wrapped.length * 4 + 4;
  // 3 blank lines
  doc.setDrawColor(100, 100, 130);
  doc.setLineWidth(0.4);
  for (let i = 0; i < 3; i++) {
    doc.line(marginX + 2, y + i * 6 + 5, marginX + contentW - 2, y + i * 6 + 5);
  }
  y += 20;
  // Hint
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 140);
  doc.text(`💡 Hint: ${p.challenge.hint.split('\n')[0]}`, marginX + 2, y);
  rgb(doc, 'setTextColor', NAVY);
  y += 4;
  // "Bring to class" tag
  doc.setFillColor(255, 217, 61);
  doc.setDrawColor(230, 165, 48);
  doc.setLineWidth(0.4);
  const tagW = 60;
  doc.roundedRect(W - marginX - tagW, y, tagW, 7, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('📅 Bring to Sunday class!', W - marginX - tagW + tagW / 2, y + 5, { align: 'center' });

  return doc;
}
