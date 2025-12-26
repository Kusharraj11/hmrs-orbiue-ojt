import { Request, Response, NextFunction } from 'express';
import { LeaveService } from '../services/leave.service';
import { LeaveStatus } from '@prisma/client';

const leaveService = new LeaveService();

export class LeaveController {

    async applyLeave(req: Request, res: Response, next: NextFunction) {
        try {
            const leave = await leaveService.applyLeave(req.body);
            res.status(201).json({
                status: 'success',
                data: leave,
                message: 'Leave application submitted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllLeaves(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const filters = {
                employeeId: req.query.employeeId as string,
                status: req.query.status as LeaveStatus
            };

            const result = await leaveService.getAllLeaves(page, limit, filters);
            res.status(200).json({
                status: 'success',
                ...result
            });
        } catch (error) {
            next(error);
        }
    }

    async getLeaveById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const leave = await leaveService.getLeaveById(id as string);
            res.status(200).json({
                status: 'success',
                data: leave
            });
        } catch (error) {
            next(error);
        }
    }

    async updateLeaveStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const leave = await leaveService.updateLeaveStatus(id as string, req.body);
            res.status(200).json({
                status: 'success',
                data: leave,
                message: `Leave request ${leave.status.toLowerCase()}`
            });
        } catch (error) {
            next(error);
        }
    }
}
