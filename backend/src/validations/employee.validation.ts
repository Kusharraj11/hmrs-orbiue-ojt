import { z } from 'zod';
import { EmployeeStatus } from '@prisma/client';

export const createEmployeeSchema = z.object({
    body: z.object({
        firstName: z.string().min(2, "First name must be at least 2 characters"),
        lastName: z.string().min(2, "Last name must be at least 2 characters"),
        email: z.string().email("Invalid email format"),
        phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
        designation: z.string().min(2, "Designation is required"),
        department: z.string().min(2, "Department is required"),
        joiningDate: z.string().datetime({ offset: true }), // ISO String expected
        salary: z.number().positive("Salary must be positive"),
        managerId: z.string().uuid().optional(),
        // We might want to create a User account simultaneously, but let's keep it simple for now or separate.
        // If strict 1-1, we assume User is created separately or we auto-generate credentials.
    })
});

export const updateEmployeeSchema = z.object({
    params: z.object({
        id: z.string().uuid("Invalid Employee ID")
    }),
    body: z.object({
        firstName: z.string().min(2).optional(),
        lastName: z.string().min(2).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        designation: z.string().optional(),
        department: z.string().optional(),
        salary: z.number().positive().optional(),
        status: z.nativeEnum(EmployeeStatus).optional(),
        managerId: z.string().uuid().optional().nullable()
    })
});

export const searchEmployeeSchema = z.object({
    query: z.object({
        page: z.string().regex(/^\d+$/).transform(Number).optional().default(1),
        limit: z.string().regex(/^\d+$/).transform(Number).optional().default(10),
        search: z.string().optional(),
        department: z.string().optional(),
        status: z.nativeEnum(EmployeeStatus).optional()
    })
});
