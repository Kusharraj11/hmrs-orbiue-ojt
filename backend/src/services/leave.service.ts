import { LeaveRepository } from '../repositories/leave.repository';
import { CreateLeaveInput, UpdateLeaveStatusInput, LeaveFilter } from '../types/leave.types';
// import { AppError } from '../middlewares/error.middleware'; 
// If not, I'll use simple Error or define AppError inline/locally if missing, 
// but I saw it used in EmployeeService. (Wait, AppError wasn't used in EmployeeService I wrote previously? I used generic errors. I will stick to throwing Error or similar for consistency with current codebase).
import { LeaveStatus, LeaveType } from '@prisma/client';

const leaveRepository = new LeaveRepository();

export class LeaveService {

    private calculateDays(start: Date, end: Date): number {
        const oneDay = 24 * 60 * 60 * 1000;
        const diffDays = Math.round(Math.abs((end.getTime() - start.getTime()) / oneDay)) + 1;
        return diffDays;
    }

    async applyLeave(data: any) {
        const { employeeId, leaveType, startDate, endDate, reason } = data;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const currentYear = start.getFullYear();

        // 1. Ensure Balance Exists
        let balance = await leaveRepository.getBalance(employeeId, currentYear);
        if (!balance) {
            // Auto-initialize default balance (Example: 12 sick, 12 casual, 15 earned)
            balance = await leaveRepository.createBalance({
                employee: { connect: { id: employeeId } },
                year: currentYear,
                sickLeave: 12,
                casualLeave: 12,
                earnedLeave: 15
            });
        }

        // 2. Check Sufficient Balance (if strict check is required on Apply, otherwise checking on Approve)
        // Let's enforce check on Apply to be nice.
        const daysRequested = this.calculateDays(start, end);

        if (leaveType === LeaveType.SICK && balance.sickLeave < daysRequested) {
            throw new Error(`Insufficient Sick Leave balance. Available: ${balance.sickLeave}, Requested: ${daysRequested}`);
        }
        if (leaveType === LeaveType.CASUAL && balance.casualLeave < daysRequested) {
            throw new Error(`Insufficient Casual Leave balance. Available: ${balance.casualLeave}, Requested: ${daysRequested}`);
        }
        if (leaveType === LeaveType.EARNED && balance.earnedLeave < daysRequested) {
            throw new Error(`Insufficient Earned Leave balance. Available: ${balance.earnedLeave}, Requested: ${daysRequested}`);
        }

        // 3. Create Request
        return await leaveRepository.createRequest({
            employee: { connect: { id: employeeId } },
            leaveType,
            startDate: start,
            endDate: end,
            reason,
            status: LeaveStatus.PENDING
        });
    }

    async getAllLeaves(page: number, limit: number, filters: any) {
        return await leaveRepository.findAllRequests(page, limit, filters);
    }

    async getLeaveById(id: string) {
        const leave = await leaveRepository.findRequestById(id);
        if (!leave) throw new Error('Leave request not found');
        return leave;
    }

    async updateLeaveStatus(id: string, data: any) {
        const { status, approverId, rejectionReason } = data;

        const leave = await leaveRepository.findRequestById(id);
        if (!leave) throw new Error('Leave request not found');

        if (leave.status !== LeaveStatus.PENDING) {
            throw new Error('Can only update status of PENDING requests');
        }

        if (status === LeaveStatus.APPROVED) {
            // Deduct Balance
            const start = new Date(leave.startDate);
            const end = new Date(leave.endDate);
            const days = this.calculateDays(start, end);
            const currentYear = start.getFullYear();

            // Refetch balance to be safe
            const balance = await leaveRepository.getBalance(leave.employeeId, currentYear);
            if (!balance) throw new Error('Leave balance record missing');

            let updateData: any = {};
            if (leave.leaveType === LeaveType.SICK) {
                if (balance.sickLeave < days) throw new Error('Insufficient Sick Leave balance during approval');
                updateData.sickLeave = balance.sickLeave - days;
            } else if (leave.leaveType === LeaveType.CASUAL) {
                if (balance.casualLeave < days) throw new Error('Insufficient Casual Leave balance during approval');
                updateData.casualLeave = balance.casualLeave - days;
            } else if (leave.leaveType === LeaveType.EARNED) {
                if (balance.earnedLeave < days) throw new Error('Insufficient Earned Leave balance during approval');
                updateData.earnedLeave = balance.earnedLeave - days;
            }

            // Update balance
            await leaveRepository.updateBalance(balance.id, updateData);
        }

        return await leaveRepository.updateStatus(id, status, approverId, rejectionReason);
    }
}
