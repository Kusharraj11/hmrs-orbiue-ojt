import { z } from 'zod';
import { LeaveType, LeaveStatus } from '@prisma/client';

export const createLeaveSchema = z.object({
    body: z.object({
        employeeId: z.string().uuid("Employee ID is required"),
        leaveType: z.nativeEnum(LeaveType),
        startDate: z.string().datetime({ offset: true, message: "Invalid start date format (ISO 8601 expected)" }),
        endDate: z.string().datetime({ offset: true, message: "Invalid end date format (ISO 8601 expected)" }),
        reason: z.string().min(5, "Reason must be at least 5 characters long")
    })
}).refine((data) => {
    const start = new Date(data.body.startDate);
    const end = new Date(data.body.endDate);
    return end >= start;
}, {
    message: "End date must be after or equal to start date",
    path: ["body", "endDate"]
});

export const updateLeaveStatusSchema = z.object({
    params: z.object({
        id: z.string().uuid("Invalid Leave Request ID")
    }),
    body: z.object({
        status: z.nativeEnum(LeaveStatus),
        approverId: z.string().uuid().optional(),
        rejectionReason: z.string().optional()
    })
}).refine((data) => {
    if (data.body.status === LeaveStatus.REJECTED && !data.body.rejectionReason) {
        return false;
    }
    return true;
}, {
    message: "Rejection reason is required when rejecting a leave",
    path: ["body", "rejectionReason"]
});

export const leaveSearchSchema = z.object({
    query: z.object({
        page: z.string().regex(/^\d+$/).transform(Number).optional().default(1),
        limit: z.string().regex(/^\d+$/).transform(Number).optional().default(10),
        employeeId: z.string().uuid().optional(),
        status: z.nativeEnum(LeaveStatus).optional()
    })
});
