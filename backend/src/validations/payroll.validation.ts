import { z } from 'zod';
import { PayrollStatus } from '@prisma/client';

export const processPayrollSchema = z.object({
    body: z.object({
        employeeId: z.string().uuid("Employee ID is required"),
        month: z.number().int().min(1).max(12),
        year: z.number().int().min(2000).max(2100)
    })
});

export const searchPayrollSchema = z.object({
    query: z.object({
        page: z.string().regex(/^\d+$/).transform(Number).optional().default(1),
        limit: z.string().regex(/^\d+$/).transform(Number).optional().default(10),
        employeeId: z.string().uuid().optional(),
        month: z.string().regex(/^\d+$/).transform(Number).optional(),
        year: z.string().regex(/^\d+$/).transform(Number).optional(),
        status: z.nativeEnum(PayrollStatus).optional()
    })
});
