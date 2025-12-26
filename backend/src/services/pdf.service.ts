import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export class PdfService {

    async generatePayslipPdf(payslip: any, employee: any, run: any): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument();
                const filename = `payslip_${employee.id}_${run.year}_${run.month}.pdf`;

                // Ensure directory exists
                const dir = path.join(__dirname, '../../uploads/payslips');
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }

                const filePath = path.join(dir, filename);
                const stream = fs.createWriteStream(filePath);
                doc.pipe(stream);

                // --- PDF Content ---
                doc.fontSize(20).text('COMPANY NAME', { align: 'center' });
                doc.fontSize(12).text('123 Corporate Blvd, Business City', { align: 'center' });
                doc.moveDown();
                doc.fontSize(16).text(`Payslip for ${run.month}/${run.year}`, { align: 'center' });
                doc.moveDown();

                // Employee Details
                doc.fontSize(12).text(`Employee ID: ${employee.id}`);
                doc.text(`Name: ${employee.firstName} ${employee.lastName}`);
                doc.text(`Department: ${employee.department}`);
                doc.text(`Designation: ${employee.designation}`);
                doc.moveDown();

                // Table Header
                const startY = doc.y;
                doc.text('Earnings', 50, startY, { underline: true });
                doc.text('Amount', 200, startY, { underline: true });
                doc.text('Deductions', 300, startY, { underline: true });
                doc.text('Amount', 450, startY, { underline: true });
                doc.moveDown();

                // Fill Data
                const details = payslip.details as any;
                let currentY = doc.y;

                // Earnings
                details.earnings?.forEach((e: any) => {
                    doc.text(e.name, 50, currentY);
                    doc.text(e.amount.toFixed(2), 200, currentY);
                    currentY += 15;
                });

                // Reset Y for Deductions
                let dedY = startY + 20; // approximate line height
                details.deductions?.forEach((d: any) => {
                    doc.text(d.name, 300, dedY);
                    doc.text(d.amount.toFixed(2), 450, dedY);
                    dedY += 15;
                });

                doc.moveDown(5);

                // Totals
                doc.font('Helvetica-Bold');
                doc.text(`Gross Earnings: ${payslip.basicSalary + payslip.allowances}`, 50);
                doc.text(`Total Deductions: ${payslip.deductions}`, 300);
                doc.moveDown();
                doc.fontSize(14).text(`NET PAY: ${payslip.netPay.toFixed(2)}`, { align: 'right' });

                doc.end();

                stream.on('finish', () => {
                    resolve(filePath);
                });

                stream.on('error', (err) => {
                    reject(err);
                });

            } catch (error) {
                reject(error);
            }
        });
    }
}
