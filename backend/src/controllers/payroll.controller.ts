import { Request, Response, NextFunction } from 'express';
import { PayrollService } from '../services/payroll.service';
import { AppError } from '../middlewares/error/AppError';
import prisma from '../config/prisma';

const payrollService = new PayrollService();

// Helper to get employeeId from userId
async function getEmployeeIdFromUser(userId: string) {
    const emp = await prisma.employee.findUnique({ where: { userId } });
    return emp ? emp.id : null;
}

export class PayrollController {

    async runPayroll(req: Request, res: Response, next: NextFunction) {
        try {
            const { month, year } = req.body;
            if (!month || !year) throw new AppError("Month and Year are required", 400);

            const result = await payrollService.runPayroll(month, year);
            res.status(200).json({
                status: 'success',
                data: result,
                message: 'Payroll processing completed'
            });
        } catch (error) {
            next(error);
        }
    }

    async getMyPayslips(req: Request, res: Response, next: NextFunction) {
        try {
            const user = (req as any).user;
            let employeeId = user.id; // Usually needed to lookup Employee table if user.id != employee.id

            // In our schema: Employee has userId.
            const realEmpId = await getEmployeeIdFromUser(user.id);
            if (!realEmpId) throw new AppError("Employee profile not found for this user", 404);

            const payslips = await payrollService.getMyPayslips(realEmpId);
            res.status(200).json({
                status: 'success',
                data: payslips
            });
        } catch (error) {
            next(error);
        }
    }

    async downloadPayslip(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const user = (req as any).user;

            // Resolve Employee ID for security check
            const realEmpId = await getEmployeeIdFromUser(user.id);
            // If Admin, pass something special or handle in service?
            // Service expects 'userId' to be the EmployeeId for check.
            // If Admin, we can pass null or handle check there.

            // Simplification: Pass role and the resolved ID
            const checkId = user.role === 'ADMIN' ? user.id : realEmpId;

            const filePath = await payrollService.downloadPayslip(id, checkId || '', user.role);

            if (filePath) {
                res.download(filePath);
            } else {
                throw new AppError("File not found", 404);
            }
        } catch (error) {
            next(error);
        }
    }
}
