import { LeaveType, LeaveStatus } from '@prisma/client';

export interface CreateLeaveInput {
    employeeId: string;
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    reason: string;
}

export interface UpdateLeaveStatusInput {
    status: LeaveStatus;
    approverId?: string;
    rejectionReason?: string;
}

export interface LeaveFilter {
    page?: number;
    limit?: number;
    employeeId?: string;
    status?: LeaveStatus;
}
