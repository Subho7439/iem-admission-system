const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFService {
  /**
   * Generate Admission Confirmation Receipt PDF
   */
  async generateAdmissionReceipt(receiptData) {
    const receiptsDir = path.resolve(__dirname, '../../uploads/receipts');
    if (!fs.existsSync(receiptsDir)) {
      fs.mkdirSync(receiptsDir, { recursive: true });
    }

    const fileName = `Receipt-${receiptData.receiptNumber}.pdf`;
    const filePath = path.join(receiptsDir, fileName);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Header Banner
      doc.rect(40, 40, 515, 65).fill('#0b2545');

      doc.fillColor('#ffffff')
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('INSTITUTE OF ENGINEERING & MANAGEMENT (IEM)', 50, 52, { align: 'center', width: 495 });

      doc.fontSize(10)
        .font('Helvetica')
        .text('Sector V, Salt Lake Electronics Complex, Kolkata, West Bengal 700091', 50, 72, { align: 'center', width: 495 });

      doc.fontSize(11)
        .font('Helvetica-Bold')
        .fillColor('#c59b27')
        .text('PROVISIONAL ADMISSION CONFIRMATION RECEIPT (ACADEMIC DEMO)', 50, 88, { align: 'center', width: 495 });

      doc.moveDown(3);

      // Receipt Metadata Row
      doc.fillColor('#13315c').fontSize(12).font('Helvetica-Bold').text(`Receipt Number: ${receiptData.receiptNumber}`, 40, 125);
      doc.fillColor('#555555').fontSize(10).font('Helvetica').text(`Issue Date: ${new Date(receiptData.issuedAt).toLocaleString('en-IN')}`, 350, 125, { align: 'right', width: 205 });

      // Horizontal separator line
      doc.moveTo(40, 145).lineTo(555, 145).strokeColor('#cbd5e1').lineWidth(1).stroke();

      // Candidate & Allotment Information Box
      doc.rect(40, 155, 515, 230).fillAndStroke('#f8fafc', '#94a3b8');

      doc.fillColor('#0b2545').fontSize(13).font('Helvetica-Bold').text('CANDIDATE & ALLOTMENT DETAILS', 55, 170);

      const fields = [
        ['Candidate Full Name:', receiptData.candidateName],
        ['Application ID:', receiptData.applicationId],
        ['Admission Cycle:', receiptData.admissionCycle || '2026-2027'],
        ['Programme Enrolled:', receiptData.programmeName],
        ['Allotted Seat Code:', receiptData.seatIdentifier],
        ['Allotted Category:', receiptData.category],
        ['Payment Reference ID:', receiptData.paymentReference],
        ['Admission Fee Paid:', `INR ${Number(receiptData.amountPaid).toLocaleString('en-IN')}/-`],
        ['Payment Status:', 'SUCCESSFUL (VERIFIED)'],
        ['Seat Acceptance Status:', 'PROVISIONALLY ACCEPTED & CONFIRMED']
      ];

      let yPos = 195;
      fields.forEach(([label, value]) => {
        doc.fillColor('#334155').fontSize(10).font('Helvetica-Bold').text(label, 60, yPos);
        doc.fillColor('#0f172a').font('Helvetica').text(String(value), 230, yPos);
        yPos += 18;
      });

      // Important Instructions Section
      doc.moveDown();
      doc.rect(40, 400, 515, 120).fillAndStroke('#eff6ff', '#bfdbfe');

      doc.fillColor('#1e40af').fontSize(11).font('Helvetica-Bold').text('IMPORTANT ADMISSION GUIDELINES & NEXT STEPS', 55, 412);

      const instructions = [
        '1. This receipt confirms your provisional seat allotment and acceptance for Academic Session 2026-2027.',
        '2. Candidate must bring this signed receipt along with all original academic documents during physical induction.',
        '3. Physical document verification will be scheduled before the commencement of the academic semester.',
        '4. In case of any discrepancies in uploaded certificates or scores, the admission is liable to cancellation.',
        '5. Note: This is an academic demonstration document issued by the IEM SE Lab Portal (PCC-CS504).'
      ];

      let instY = 432;
      instructions.forEach(inst => {
        doc.fillColor('#1e3a8a').fontSize(8.5).font('Helvetica').text(inst, 55, instY, { width: 485 });
        instY += 16;
      });

      // Signature & Stamp Section
      doc.moveTo(40, 560).lineTo(555, 560).strokeColor('#cbd5e1').stroke();

      doc.fillColor('#64748b').fontSize(9).font('Helvetica-Bold').text('System Generated Electronic Receipt', 45, 575);
      doc.font('Helvetica').text('No physical signature required (Timestamped)', 45, 590);

      doc.fillColor('#0b2545').fontSize(10).font('Helvetica-Bold').text('Registrar / Admission In-Charge', 360, 575, { align: 'right', width: 190 });
      doc.fillColor('#64748b').fontSize(8.5).font('Helvetica').text('Institute of Engineering & Management, Kolkata', 360, 590, { align: 'right', width: 190 });

      // Footer Watermark / Disclaimer
      doc.rect(40, 720, 515, 30).fill('#f1f5f9');
      doc.fillColor('#64748b').fontSize(7.5).font('Helvetica').text(
        'IEM Admission Management System - Academic Software Engineering Project Demonstration (PCC-CS504). Not a legal contract.',
        45, 730, { align: 'center', width: 505 }
      );

      doc.end();

      stream.on('finish', () => resolve(filePath));
      stream.on('error', (err) => reject(err));
    });
  }
}

module.exports = new PDFService();
