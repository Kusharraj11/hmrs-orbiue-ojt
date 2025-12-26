import { Request, Response, NextFunction } from 'express';
import { EmployeeService } from '../services/employee.service';
import { CreateEmployeeInput, UpdateEmployeeInput, EmployeeFilter } from '../types/employee.types';
import { EmployeeStatus } from '@prisma/client';

const employeeService = new EmployeeService();

export class EmployeeController {

    async createEmployee(req: Request, res: Response, next: NextFunction) {
        try {
            const data: CreateEmployeeInput = req.body;
            const employee = await employeeService.createEmployee(data);
            res.status(201).json({
                status: 'success',
                data: employee
            });
        } catch (error) {
            next(error);
        }
    }

    async getEmployeeById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const employee = await employeeService.getEmployeeById(id as string);
            res.status(200).json({
                status: 'success',
                data: employee
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllEmployees(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const filters: EmployeeFilter = {
                search: req.query.search as string,
                department: req.query.department as string,
                status: req.query.status as EmployeeStatus
            };

            const result = await employeeService.getAllEmployees(page, limit, filters);
            res.status(200).json({
                status: 'success',
                ...result
            });
        } catch (error) {
            next(error);
        }
    }

    async updateEmployee(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const data: UpdateEmployeeInput = req.body;
            const employee = await employeeService.updateEmployee(id as string, data);
            res.status(200).json({
                status: 'success',
                data: employee
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteEmployee(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await employeeService.deleteEmployee(id as string);
            res.status(200).json({
                status: 'success',
                message: 'Employee terminated successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}
