import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

// ── Palette  (near-monochromatic + single indigo accent) ──────────────────────
const C = {
  ink:      [15,  23,  42],   // slate-900  – headings & strong text
  body:     [51,  65,  85],   // slate-700  – body copy
  muted:    [100, 116, 139],  // slate-500  – labels / metadata
  rule:     [203, 213, 225],  // slate-300  – borders / dividers
  surface:  [248, 250, 252],  // slate-50   – alt rows / card fills
  accent:   [79,  70, 229],   // indigo-600 – ONLY accent
  accentBg: [238, 242, 255],  // indigo-50  – pill / badge bg
  white:    [255, 255, 255],
};

// ── Page geometry ─────────────────────────────────────────────────────────────
const PW = 210;          // A4 width  (mm)
const PH = 297;          // A4 height (mm)
const ML = 18;           // left margin
const MR = 18;           // right margin
const CW = PW - ML - MR; // usable content width

// ── Micro-utilities ───────────────────────────────────────────────────────────
const INR = (n) =>
  `Rs. ${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n || 0)}`;

const hRule = (doc, y, color = C.rule, lw = 0.2) => {
  doc.setLineWidth(lw);
  doc.setDrawColor(...color);
  doc.line(ML, y, PW - MR, y);
};

const sectionLabel = (doc, text, y) => {
  doc.setFontSize(7.5);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...C.accent);
  doc.text(text.toUpperCase(), ML, y);
  hRule(doc, y + 2.5, C.accent, 0.35);
  return y + 9;
};

const stampFooter = (doc, pageNum, total, monthYear) => {
  const y = PH - 10;
  hRule(doc, y - 3.5);
  doc.setFontSize(7);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(...C.muted);
  doc.text(`Expense Report  ·  ${monthYear}`, ML, y);
  doc.text(`Page ${pageNum} / ${total}`, PW / 2, y, { align: 'center' });
  doc.text(
    `Generated ${format(new Date(), 'dd MMM yyyy, hh:mm a')}`,
    PW - MR, y, { align: 'right' }
  );
};

// ── Main export ───────────────────────────────────────────────────────────────
export const generatePDF = async (expenses, selectedMonth) => {
  try {
    const doc       = new jsPDF({ unit: 'mm', format: 'a4' });
    const monthYear = format(selectedMonth, 'MMMM yyyy');

    // Partition
    const expOnly  = expenses.filter((e) => (e.recordType || 'expense') === 'expense');
    const lendOnly = expenses.filter((e) => (e.recordType || 'expense') === 'lend');
    const borrOnly = expenses.filter((e) => (e.recordType || 'expense') === 'borrow');

    const totExp  = expOnly.reduce( (s, e) => s + parseFloat(e.amount || 0), 0);
    const totLent = lendOnly.reduce((s, e) => s + parseFloat(e.amount || 0), 0);
    const totBorr = borrOnly.reduce((s, e) => s + parseFloat(e.amount || 0), 0);

    const catTotals = {};
    expOnly.forEach((e) => {
      const k = e.category || 'Other';
      catTotals[k] = (catTotals[k] || 0) + (parseFloat(e.amount) || 0);
    });

    // ── HEADER ───────────────────────────────────────────────────────────────
    // 3 mm indigo top bar
    doc.setFillColor(...C.accent);
    doc.rect(0, 0, PW, 3, 'F');

    let y = 18;

    // Title
    doc.setFontSize(17);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...C.ink);
    doc.text('Expense Report', ML, y);

    // Month pill (top-right)
    const pillW = 36;
    doc.setFillColor(...C.accentBg);
    doc.setDrawColor(...C.accent);
    doc.setLineWidth(0.3);
    doc.roundedRect(PW - MR - pillW, y - 6.5, pillW, 8.5, 2, 2, 'FD');
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...C.accent);
    doc.text(monthYear, PW - MR - pillW / 2, y - 1.2, { align: 'center' });

    // Sub-line
    y += 5.5;
    doc.setFontSize(8.5);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...C.muted);
    doc.text(`${expenses.length} transactions recorded`, ML, y);

    y += 7;
    hRule(doc, y);

    // ── SUMMARY CARDS ────────────────────────────────────────────────────────
    y += 10;
    y = sectionLabel(doc, 'Summary', y);

    const stats = [
      { label: 'Total Expenses', value: INR(totExp),           note: `${expOnly.length} entries`  },
      { label: 'Total Lent',     value: INR(totLent),          note: `${lendOnly.length} entries` },
      { label: 'Total Borrowed', value: INR(totBorr),          note: `${borrOnly.length} entries` },
      { label: 'Net Balance',    value: INR(totLent - totBorr), note: totLent >= totBorr ? 'net receivable' : 'net payable' },
    ];

    const colW = (CW - 6) / 4;

    stats.forEach((s, i) => {
      const x = ML + i * (colW + 2);

      // Card background + border
      doc.setFillColor(...C.surface);
      doc.setDrawColor(...C.rule);
      doc.setLineWidth(0.2);
      doc.roundedRect(x, y, colW, 19, 1.5, 1.5, 'FD');

      // Label
      doc.setFontSize(7);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(...C.muted);
      doc.text(s.label, x + colW / 2, y + 5.5, { align: 'center' });

      // Value
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(...C.ink);
      doc.text(s.value, x + colW / 2, y + 12.5, { align: 'center' });

      // Note
      doc.setFontSize(6.5);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(...C.muted);
      doc.text(s.note, x + colW / 2, y + 17, { align: 'center' });
    });

    y += 27;

    // ── CATEGORY BREAKDOWN ───────────────────────────────────────────────────
    y = sectionLabel(doc, 'Category Breakdown', y);

    const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
    const catRows    = sortedCats.length
      ? sortedCats.map(([cat, amt]) => [
          cat,
          INR(amt),
          totExp > 0 ? `${((amt / totExp) * 100).toFixed(1)}%` : '—',
        ])
      : [['No expense records', '—', '—']];

    doc.autoTable({
      startY: y,
      head: [['Category', 'Amount', 'Share']],
      body: catRows,
      theme: 'plain',
      margin: { left: ML, right: MR },
      headStyles: {
        fillColor:   C.ink,
        textColor:   C.white,
        fontStyle:   'bold',
        fontSize:    8,
        cellPadding: { top: 3.5, bottom: 3.5, left: 5, right: 5 },
      },
      bodyStyles: {
        fontSize:    8.5,
        textColor:   C.body,
        cellPadding: { top: 3, bottom: 3, left: 5, right: 5 },
      },
      alternateRowStyles: { fillColor: C.surface },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { halign: 'right', fontStyle: 'bold', textColor: C.ink },
        2: { halign: 'right', textColor: C.muted, cellWidth: 22 },
      },
      tableLineColor: C.rule,
      tableLineWidth: 0.15,
    });

    // ── TRANSACTION DETAILS ──────────────────────────────────────────────────
    y = doc.lastAutoTable.finalY + 14;
    if (y > 230) { doc.addPage(); y = 20; }

    y = sectionLabel(doc, 'All Transactions', y);

    const txRows = expenses.map((e) => [
      format(new Date(e.date), 'dd MMM yyyy'),
      (e.recordType || 'expense').toUpperCase(),
      e.category      || '—',
      e.counterparty  || '—',
      e.description   || '—',
      INR(e.amount),
    ]);

    doc.autoTable({
      startY: y,
      head: [['Date', 'Type', 'Category', 'Person', 'Description', 'Amount']],
      body: txRows,
      theme: 'plain',
      margin: { left: ML, right: MR },
      headStyles: {
        fillColor:   C.ink,
        textColor:   C.white,
        fontStyle:   'bold',
        fontSize:    8,
        cellPadding: { top: 3.5, bottom: 3.5, left: 5, right: 5 },
      },
      bodyStyles: {
        fontSize:    8,
        textColor:   C.body,
        cellPadding: { top: 3, bottom: 3, left: 5, right: 5 },
      },
      alternateRowStyles: { fillColor: C.surface },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 20 },
        2: { cellWidth: 28 },
        3: { cellWidth: 28 },
        4: { cellWidth: 'auto' },
        5: { halign: 'right', fontStyle: 'bold', textColor: C.ink, cellWidth: 26 },
      },
      tableLineColor: C.rule,
      tableLineWidth: 0.15,
      didParseCell(data) {
        if (data.section !== 'body' || data.column.index !== 1) return;
        const v = data.cell.raw;
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fontSize  = 7;
        data.cell.styles.textColor =
          v === 'LEND'   ? [146,  64,  14] :  // amber-800 – earthy, warm
          v === 'BORROW' ? [153,  27,  27] :  // red-800   – clear warning
                           C.accent;           // indigo    – standard expense
      },
    });

    // ── FOOTER ON EVERY PAGE ─────────────────────────────────────────────────
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      stampFooter(doc, i, totalPages, monthYear);
    }

    // ── SAVE ─────────────────────────────────────────────────────────────────
    doc.save(`Expense_Report_${format(selectedMonth, 'MMM_yyyy')}.pdf`);
    return true;

  } catch (err) {
    console.error('Error generating PDF:', err);
    throw err;
  }
};