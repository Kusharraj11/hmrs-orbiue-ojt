import { EmployeeRepository } from '../repositories/employee.repository';
import { CreateEmployeeInput, UpdateEmployeeInput, EmployeeFilter } from '../types/employee.types';
import { AppError } from '../middlewares/error/AppError';
import { Prisma } from '@prisma/client';
import prisma from '../config/prisma';

export class EmployeeService {
    private employeeRepository: EmployeeRepository;

    constructor() {
        this.employeeRepository = new EmployeeRepository();
    }

    async createEmployee(data: CreateEmployeeInput) {
        // 1. Check duplicate email
        const existing = await this.employeeRepository.findByEmail(data.email);
        if (existing) {
            throw new AppError('Employee with this email already exists', 409);
        }

        // 2. Validate manager if provided
        if (data.managerId) {
            const manager = await this.employeeRepository.findById(data.managerId);
            if (!manager) {
                throw new AppError('Manager not found', 404);
            }
        }

        // 3. Prepare data for Prisma
        const hashedPassword = await import('bcryptjs').then(m => m.default.hash('password123', 10));

        // Use transaction to ensure both created or neither
        return await prisma.$transaction(async (tx) => {
            const employee = await tx.employee.create({
                data: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    phone: data.phone,
                    designation: data.designation,
                    department: data.department,
                    joiningDate: new Date(data.joiningDate),
                    salary: data.salary,
                    manager: data.managerId ? { connect: { id: data.managerId } } : undefined
                }
            });

            // Create associated User account
            await tx.user.create({
                data: {
                    email: data.email,
                    password: hashedPassword,
                    role: 'EMPLOYEE',
                    employee: { connect: { id: employee.id } }
                }
            });

            return employee;
        });
    }

    async getEmployeeById(id: string) {
        const employee = await this.employeeRepository.findById(id);
        if (!employee) {
            throw new AppError('Employee not found', 404);
        }
        return employee;
    }

    async getAllEmployees(page: number, limit: number, filters: EmployeeFilter) {
        return await this.employeeRepository.findAll(page, limit, filters);
    }

    async updateEmployee(id: string, data: UpdateEmployeeInput) {
        const employee = await this.employeeRepository.findById(id);
        if (!employee) {
            throw new AppError('Employee not found', 404);
        }

        // If updating email, check uniqueness
        if (data.email && data.email !== employee.email) {
            const existing = await this.employeeRepository.findByEmail(data.email);
            if (existing) {
                throw new AppError('Email already in use', 409);
            }
        }

        // Validate manager if updating
        if (data.managerId) {
            // Prevent self-reference
            if (data.managerId === id) {
                throw new AppError('Cannot report to self', 400);
            }
            const manager = await this.employeeRepository.findById(data.managerId);
            if (!manager) {
                throw new AppError('Manager not found', 404);
            }
        }

        // Prisma update logic for manager relation
        let managerUpdate: any = undefined;
        if (data.managerId) {
            managerUpdate = { connect: { id: data.managerId } };
        } else if (data.managerId === null) {
            managerUpdate = { disconnect: true };
        }

        const { managerId, ...rest } = data;

        const prismaUpdate: Prisma.EmployeeUpdateInput = {
            ...rest,
            manager: managerUpdate
        };

        return await this.employeeRepository.update(id, prismaUpdate);
    }

    async deleteEmployee(id: string) {
        const employee = await this.employeeRepository.findById(id);
        if (!employee) {
            throw new AppError('Employee not found', 404);
        }
        return await this.employeeRepository.delete(id);
    }
}
