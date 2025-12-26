import prisma from '../config/prisma';
import { LeaveType } from '@prisma/client';
import { AppError } from '../middlewares/error/AppError';

export class LeavePolicyService {

    async createPolicy(data: { leaveType: LeaveType, maxDaysPerYear: number, carryForwardLimit: number }) {
        const existing = await prisma.leavePolicy.findUnique({
            where: { leaveType: data.leaveType }
        });

        if (existing) {
            throw new AppError(`Policy for ${data.leaveType} already exists`, 409);
        }

        return await prisma.leavePolicy.create({ data });
    }

    async getAllPolicies() {
        return await prisma.leavePolicy.findMany();
    }

    async updatePolicy(id: string, data: { maxDaysPerYear?: number, carryForwardLimit?: number }) {
        const existing = await prisma.leavePolicy.findUnique({ where: { id } });
        if (!existing) {
            throw new AppError('Policy not found', 404);
        }

        return await prisma.leavePolicy.update({
            where: { id },
            data
        });
    }

    async deletePolicy(id: string) {
        return await prisma.leavePolicy.delete({ where: { id } });
    }
}
