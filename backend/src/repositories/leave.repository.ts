import prisma from '../config/prisma';
import { LeaveRequest, LeaveBalance, LeaveStatus, Prisma } from '@prisma/client';

export class LeaveRepository {

    async createRequest(data: Prisma.LeaveRequestCreateInput): Promise<LeaveRequest> {
        return await prisma.leaveRequest.create({
            data
        });
    }

    async findRequestById(id: string): Promise<LeaveRequest | null> {
        return await prisma.leaveRequest.findUnique({
            where: { id },
            include: {
                employee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });
    }

    async findAllRequests(
        page: number,
        limit: number,
        filter: { employeeId?: string; status?: LeaveStatus }
    ) {
        const skip = (page - 1) * limit;
        const whereClause: Prisma.LeaveRequestWhereInput = {
            ...(filter.employeeId && { employeeId: filter.employeeId }),
            ...(filter.status && { status: filter.status })
        };

        const [total, data] = await Promise.all([
            prisma.leaveRequest.count({ where: whereClause }),
            prisma.leaveRequest.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    employee: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            department: true
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

    async updateStatus(id: string, status: LeaveStatus, approverId?: string, rejectionReason?: string): Promise<LeaveRequest> {
        return await prisma.leaveRequest.update({
            where: { id },
            data: {
                status,
                approverId,
                rejectionReason
            }
        });
    }

    // Balance Management
    async getBalance(employeeId: string, year: number): Promise<LeaveBalance | null> {
        return await prisma.leaveBalance.findFirst({
            where: {
                employeeId,
                year
            }
        });
    }

    async createBalance(data: Prisma.LeaveBalanceCreateInput): Promise<LeaveBalance> {
        return await prisma.leaveBalance.create({
            data
        });
    }

    async updateBalance(id: string, data: Prisma.LeaveBalanceUpdateInput): Promise<LeaveBalance> {
        return await prisma.leaveBalance.update({
            where: { id },
            data
        });
    }
}
