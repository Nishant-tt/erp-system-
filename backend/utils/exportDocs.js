const PDFDocument = require("pdfkit");
const { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType } = require("docx");

function safe(v) {
  if (v === null || v === undefined) return "";
  return String(v);
}

function buildPdfBuffer({ title, meta = [], columns = [], rows = [] }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 36 });
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(18).font("Helvetica-Bold").text(safe(title));
    doc.moveDown(0.5);

    doc.fontSize(10).font("Helvetica");
    for (const [k, v] of meta) {
      doc.text(`${safe(k)}: ${safe(v)}`);
    }

    doc.moveDown(1);

    // Simple table rendering (best-effort; for wide data user can use DOCX)
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const colCount = Math.max(1, columns.length);
    const colWidth = pageWidth / colCount;
    const startX = doc.page.margins.left;
    let y = doc.y;

    doc.font("Helvetica-Bold").fontSize(9);
    columns.forEach((c, i) => {
      doc.text(safe(c), startX + i * colWidth, y, { width: colWidth - 4, continued: false });
    });
    y = doc.y + 6;
    doc.moveTo(startX, y).lineTo(startX + pageWidth, y).strokeColor("#E5E7EB").stroke();
    y += 6;

    doc.font("Helvetica").fontSize(9);
    for (const r of rows) {
      const rowY = y;
      let maxY = y;
      r.forEach((cell, i) => {
        doc.text(safe(cell), startX + i * colWidth, rowY, { width: colWidth - 4 });
        maxY = Math.max(maxY, doc.y);
      });
      y = maxY + 8;
      if (y > doc.page.height - doc.page.margins.bottom - 36) {
        doc.addPage();
        y = doc.page.margins.top;
      }
    }

    doc.end();
  });
}

async function buildDocxBuffer({ title, meta = [], columns = [], rows = [] }) {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [new TextRun({ text: safe(title), bold: true, size: 32 })],
          }),
          ...meta.map(([k, v]) =>
            new Paragraph({
              children: [
                new TextRun({ text: `${safe(k)}: `, bold: true }),
                new TextRun({ text: safe(v) }),
              ],
            })
          ),
          new Paragraph({ text: "" }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: columns.map((c) =>
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: safe(c), bold: true })] })],
                  })
                ),
              }),
              ...rows.map(
                (r) =>
                  new TableRow({
                    children: r.map((cell) =>
                      new TableCell({
                        children: [new Paragraph(safe(cell))],
                      })
                    ),
                  })
              ),
            ],
          }),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}

module.exports = {
  buildPdfBuffer,
  buildDocxBuffer,
};

