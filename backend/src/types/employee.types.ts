import { EmployeeStatus } from '@prisma/client';

export interface CreateEmployeeInput {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    designation: string;
    department: string;
    joiningDate: string;
    salary: number;
    managerId?: string;
}

export interface UpdateEmployeeInput {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    designation?: string;
    department?: string;
    salary?: number;
    status?: EmployeeStatus;
    managerId?: string | null;
}

export interface EmployeeFilter {
    search?: string;
    department?: string;
    status?: EmployeeStatus;
}
