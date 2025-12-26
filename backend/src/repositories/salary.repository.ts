import prisma from '../config/prisma';
import { SalaryComponent, EmployeeSalaryComponent, SalaryComponentType } from '@prisma/client';

export class SalaryRepository {

    async createComponent(data: { name: string; type: SalaryComponentType; isFixed: boolean; percentage?: number }) {
        return await prisma.salaryComponent.create({
            data
        });
    }

    async getAllComponents() {
        return await prisma.salaryComponent.findMany({
            where: { isActive: true }
        });
    }

    async getComponentById(id: string) {
        return await prisma.salaryComponent.findUnique({
            where: { id }
        });
    }

    async assignComponentToEmployee(employeeId: string, componentId: string, amount: number) {
        return await prisma.employeeSalaryComponent.create({
            data: {
                employeeId,
                componentId,
                amount
            }
        });
    }

    async getEmployeeStructure(employeeId: string) {
        return await prisma.employeeSalaryComponent.findMany({
            where: { employeeId },
            include: {
                component: true
            }
        });
    }

    async clearEmployeeStructure(employeeId: string) {
        return await prisma.employeeSalaryComponent.deleteMany({
            where: { employeeId }
        });
    }
}
