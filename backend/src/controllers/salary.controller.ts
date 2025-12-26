import { Request, Response, NextFunction } from 'express';
import { SalaryService } from '../services/salary.service';

const salaryService = new SalaryService();

export class SalaryController {
    async createComponent(req: Request, res: Response, next: NextFunction) {
        try {
            const component = await salaryService.createComponent(req.body);
            res.status(201).json({
                status: 'success',
                data: component,
                message: 'Salary component created successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllComponents(req: Request, res: Response, next: NextFunction) {
        try {
            const components = await salaryService.getAllComponents();
            res.status(200).json({
                status: 'success',
                data: components
            });
        } catch (error) {
            next(error);
        }
    }

    async updateEmployeeStructure(req: Request, res: Response, next: NextFunction) {
        try {
            const { employeeId } = req.params;
            const { components } = req.body; // Array of { componentId, amount }

            const result = await salaryService.updateEmployeeStructure(employeeId, components);
            res.status(200).json({
                status: 'success',
                data: result,
                message: 'Employee salary structure updated'
            });
        } catch (error) {
            next(error);
        }
    }

    async getEmployeeStructure(req: Request, res: Response, next: NextFunction) {
        try {
            const { employeeId } = req.params;
            const structure = await salaryService.getEmployeeStructure(employeeId);
            res.status(200).json({
                status: 'success',
                data: structure
            });
        } catch (error) {
            next(error);
        }
    }
}
