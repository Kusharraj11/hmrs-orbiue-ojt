import { SalaryRepository } from '../repositories/salary.repository';
import { SalaryComponentType } from '@prisma/client';

const salaryRepository = new SalaryRepository();

export class SalaryService {
    async createComponent(data: { name: string; type: SalaryComponentType; isFixed: boolean; percentage?: number }) {
        // Validation: If not fixed, percentage is required
        if (!data.isFixed && (data.percentage === undefined || data.percentage === null)) {
            throw new Error("Percentage is required for non-fixed components");
        }
        return await salaryRepository.createComponent(data);
    }

    async getAllComponents() {
        return await salaryRepository.getAllComponents();
    }

    async updateEmployeeStructure(employeeId: string, components: { componentId: string; amount: number }[]) {
        // 1. Validate all components exist (Optional but good practice)
        // 2. Clear existing structure (Full update approach)
        await salaryRepository.clearEmployeeStructure(employeeId);

        // 3. Assign new components
        const results = [];
        for (const comp of components) {
            const added = await salaryRepository.assignComponentToEmployee(employeeId, comp.componentId, comp.amount);
            results.push(added);
        }
        return results;
    }

    async getEmployeeStructure(employeeId: string) {
        return await salaryRepository.getEmployeeStructure(employeeId);
    }
}
