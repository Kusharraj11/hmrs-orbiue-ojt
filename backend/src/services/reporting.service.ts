
import { ReportingRepository } from '../repositories/reporting.repository';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const reportingRepo = new ReportingRepository();

export class ReportingService {

    async getDashboardStats() {
        return await reportingRepo.getDashboardStats();
    }

    async getLeaveLiability(department?: string) {
        const balances = await reportingRepo.getLeaveLiability(department);

        // Transform for easier consumption
        return balances.map(b => ({
            employeeId: b.employee.id,
            name: `${b.employee.firstName} ${b.employee.lastName}`,
            department: b.employee.department,
            casualLeave: b.casualLeave,
            sickLeave: b.sickLeave,
            earnedLeave: b.earnedLeave,
            totalLiabilityDays: b.casualLeave + b.sickLeave + b.earnedLeave
        }));
    }

    async getAttendanceAnomalies(startDateStr?: string, endDateStr?: string) {
        // Default to current month if no dates provided
        const now = new Date();
        const start = startDateStr ? new Date(startDateStr) : new Date(now.getFullYear(), now.getMonth(), 1);
        const end = endDateStr ? new Date(endDateStr) : new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const anomalies = await reportingRepo.getAttendanceAnomalies(start, end);

        return anomalies.map(a => ({
            date: a.date,
            employeeId: a.employee.id,
            name: `${a.employee.firstName} ${a.employee.lastName}`,
            department: a.employee.department,
            status: a.status,
            checkIn: a.checkIn,
            checkOut: a.checkOut,
            totalHours: a.totalHours,
            remarks: a.remarks || (a.status === 'LATE' ? 'Late Arrival' : 'Short Hours')
        }));
    }

    // --- Export Logic ---

    async exportLeaveLiabilityPDF(department?: string): Promise<string> {
        const data = await this.getLeaveLiability(department);

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument();
            const filename = `leave_liability_${Date.now()}.pdf`;
            const dir = path.join(__dirname, '../../uploads/reports');

            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

            const filePath = path.join(dir, filename);
            const stream = fs.createWriteStream(filePath);

            doc.pipe(stream);

            // Header
            doc.fontSize(18).text('Leave Liability Report', { align: 'center' });
            doc.fontSize(12).text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
            if (department) doc.text(`Department: ${department}`, { align: 'center' });
            doc.moveDown();

            // Table
            let y = doc.y;
            doc.font('Helvetica-Bold');
            doc.text('Name', 50, y);
            doc.text('Dept', 200, y);
            doc.text('Casual', 300, y);
            doc.text('Sick', 360, y);
            doc.text('Earned', 420, y);
            doc.text('Total', 480, y);
            doc.font('Helvetica');
            y += 20;

            doc.moveTo(50, y).lineTo(550, y).stroke();
            y += 10;

            data.forEach(row => {
                if (y > 700) {
                    doc.addPage();
                    y = 50;
                }
                doc.text(row.name, 50, y);
                doc.text(row.department, 200, y);
                doc.text(row.casualLeave.toString(), 300, y);
                doc.text(row.sickLeave.toString(), 360, y);
                doc.text(row.earnedLeave.toString(), 420, y);
                doc.text(row.totalLiabilityDays.toString(), 480, y);
                y += 20;
            });

            doc.end();
            stream.on('finish', () => resolve(filePath));
            stream.on('error', reject);
        });
    }

    async exportLeaveLiabilityCSV(department?: string): Promise<string> {
        const data = await this.getLeaveLiability(department);
        const fields = ['employeeId', 'name', 'department', 'casualLeave', 'sickLeave', 'earnedLeave', 'totalLiabilityDays'];
        const json2csv = new Parser({ fields });
        return json2csv.parse(data);
    }
}
