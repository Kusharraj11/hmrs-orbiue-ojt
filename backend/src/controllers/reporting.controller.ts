
import { Request, Response, NextFunction } from 'express';
import { ReportingService } from '../services/reporting.service';

const reportingService = new ReportingService();

export class ReportingController {

    async getDashboardStats(req: Request, res: Response, next: NextFunction) {
        try {
            const stats = await reportingService.getDashboardStats();
            res.json({
                status: 'success',
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }

    async getLeaveLiability(req: Request, res: Response, next: NextFunction) {
        try {
            const { department } = req.query;
            const data = await reportingService.getLeaveLiability(department as string);
            res.json({
                status: 'success',
                data
            });
        } catch (error) {
            next(error);
        }
    }

    async downloadLeaveLiability(req: Request, res: Response, next: NextFunction) {
        try {
            const { department, format } = req.query;

            if (format === 'csv') {
                const csv = await reportingService.exportLeaveLiabilityCSV(department as string);
                res.header('Content-Type', 'text/csv');
                res.attachment('leave_liability.csv');
                return res.send(csv);
            } else {
                // Default PDF
                const pdfPath = await reportingService.exportLeaveLiabilityPDF(department as string);
                res.download(pdfPath);
            }
        } catch (error) {
            next(error);
        }
    }

    async getAttendanceAnomalies(req: Request, res: Response, next: NextFunction) {
        try {
            const { startDate, endDate } = req.query;
            const data = await reportingService.getAttendanceAnomalies(startDate as string, endDate as string);
            res.json({
                status: 'success',
                data
            });
        } catch (error) {
            next(error);
        }
    }
}
