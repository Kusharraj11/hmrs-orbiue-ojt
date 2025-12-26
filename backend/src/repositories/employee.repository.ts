import prisma from '../config/prisma';
import { Employee, Prisma, EmployeeStatus } from '@prisma/client';

export class EmployeeRepository {

    async create(data: Prisma.EmployeeCreateInput): Promise<Employee> {
        return await prisma.employee.create({
            data,
            include: {
                manager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });
    }

    async findById(id: string): Promise<Employee | null> {
        return await prisma.employee.findUnique({
            where: { id },
            include: {
                manager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                },
                subordinates: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        designation: true
                    }
                },
                user: {
                    select: {
                        email: true,
                        role: true
                    }
                }
            }
        });
    }

    async findByEmail(email: string): Promise<Employee | null> {
        return await prisma.employee.findUnique({
            where: { email }
        });
    }

    async findAll(
        page: number,
        limit: number,
        filter: { search?: string; department?: string; status?: EmployeeStatus }
    ) {
        const skip = (page - 1) * limit;

        const whereClause: Prisma.EmployeeWhereInput = {
            ...(filter.department && { department: filter.department }),
            ...(filter.status && { status: filter.status }),
            ...(filter.search && {
                OR: [
                    { firstName: { contains: filter.search, mode: 'insensitive' } },
                    { lastName: { contains: filter.search, mode: 'insensitive' } },
                    { email: { contains: filter.search, mode: 'insensitive' } },
                ]
            })
        };

        const [total, data] = await Promise.all([
            prisma.employee.count({ where: whereClause }),
            prisma.employee.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    manager: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true
                        }
                    }
                }
            })
        ]);

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async update(id: string, data: Prisma.EmployeeUpdateInput): Promise<Employee> {
        return await prisma.employee.update({
            where: { id },
            data,
        });
    }

    async delete(id: string): Promise<Employee> {
        // Soft delete
        return await prisma.employee.update({
            where: { id },
            data: { status: EmployeeStatus.TERMINATED }
        });
    }
}
