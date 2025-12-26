import prisma from '../config/prisma';
import { PayrollStatus } from '@prisma/client';

export class PayrollRepository {

    async createRun(month: number, year: number) {
        return await prisma.payrollRun.create({
            data: {
                month,
                year,
                status: 'PROCESSED'
            }
        });
    }

    async createPayslip(data: any) {
        return await prisma.payslip.create({
            data
        });
    }

    async getPayslipsByRun(runId: string) {
        return await prisma.payslip.findMany({
            where: { payrollRunId: runId },
            include: { employee: true }
        });
    }

    async getEmployeePayslips(employeeId: string) {
        return await prisma.payslip.findMany({
            where: { employeeId },
            include: { payrollRun: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getPayslipById(id: string) {
        return await prisma.payslip.findUnique({
            where: { id },
            include: { employee: true, payrollRun: true }
        });
    }
}
