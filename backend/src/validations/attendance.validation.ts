import { z } from 'zod';

export const clockInSchema = z.object({
    body: z.object({
        employeeId: z.string().uuid("Employee ID is required"),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        notes: z.string().optional()
    })
});

export const clockOutSchema = z.object({
    body: z.object({
        employeeId: z.string().uuid("Employee ID is required"),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        notes: z.string().optional()
    })
});

export const ingestSchema = z.object({
    body: z.object({
        employeeId: z.string().uuid("Employee ID is required"),
        timestamp: z.string().datetime({ offset: true }),
        type: z.enum(['IN', 'OUT']),
        device: z.string().optional()
    })
});

export const processDailySchema = z.object({
    body: z.object({
        employeeId: z.string().uuid("Employee ID is required"),
        date: z.string().date().optional() // YYYY-MM-DD. Optional = Today.
        // Note: z.string().date() is newer Zod. If error, use regex.
        // Let's use string() for safety in case Zod version old.
    })
});

export const regularizeSchema = z.object({
    params: z.object({
        id: z.string().uuid("Attendance Record ID is required")
    }),
    body: z.object({
        checkIn: z.string().datetime({ offset: true }),
        checkOut: z.string().datetime({ offset: true }),
        remarks: z.string().min(5, "Reason is required (min 5 chars)")
    })
});

export const attendanceSearchSchema = z.object({
    query: z.object({
        page: z.string().regex(/^\d+$/).transform(Number).optional().default(1),
        limit: z.string().regex(/^\d+$/).transform(Number).optional().default(10),
        employeeId: z.string().uuid().optional(),
        startDate: z.string().datetime({ offset: true }).optional(),
        endDate: z.string().datetime({ offset: true }).optional()
    })
});
