import { Request, Response, NextFunction } from 'express';
import { AttendanceService } from '../services/attendance.service';

const attendanceService = new AttendanceService();

export class AttendanceController {

    async ingest(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await attendanceService.ingest(req.body);
            res.status(201).json({
                status: 'success',
                data: result,
                message: 'Attendance record ingested successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    async process(req: Request, res: Response, next: NextFunction) {
        try {
            const { employeeId, date } = req.body;
            // Default date to today if missing
            const targetDate = date || new Date().toISOString().split('T')[0];

            const result = await attendanceService.processDailyAttendance(employeeId, targetDate);
            res.status(200).json({
                status: 'success',
                data: result,
                message: 'Daily attendance processed'
            });
        } catch (error) {
            next(error);
        }
    }

    async regularize(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const result = await attendanceService.regularize(id, req.body);
            res.status(200).json({
                status: 'success',
                data: result,
                message: 'Attendance regularized successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    async clockIn(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await attendanceService.clockIn(req.body);
            res.status(201).json({
                status: 'success',
                data: result,
                message: 'Clock in successful'
            });
        } catch (error) {
            next(error);
        }
    }

    async clockOut(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await attendanceService.clockOut(req.body);
            res.status(200).json({
                status: 'success',
                data: result,
                message: 'Clock out successful'
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllAttendance(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const filters = {
                employeeId: req.query.employeeId as string,
                startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
                endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined
            };

            const result = await attendanceService.getAllAttendance(page, limit, filters);
            res.status(200).json({
                status: 'success',
                ...result
            });
        } catch (error) {
            next(error);
        }
    }
}
