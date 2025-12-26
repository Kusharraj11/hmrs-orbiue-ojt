import { Router } from 'express';
import { SalaryController } from '../controllers/salary.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { z } from 'zod'; // Minimal validation inline or move to validation file
import { validateRequest } from '../middlewares/validate.middleware';

const router = Router();
const salaryController = new SalaryController();

const createComponentSchema = z.object({
    body: z.object({
        name: z.string().min(2),
        type: z.enum(['EARNING', 'DEDUCTION']),
        isFixed: z.boolean(),
        percentage: z.number().optional()
    })
});

const updateStructureSchema = z.object({
    body: z.object({
        components: z.array(z.object({
            componentId: z.string().uuid(),
            amount: z.number().min(0)
        }))
    })
});

// Components Config (HR/Admin only)
router.post(
    '/components',
    authenticate,
    authorize(['ADMIN', 'HR']),
    validateRequest(createComponentSchema),
    salaryController.createComponent
);

router.get(
    '/components',
    authenticate,
    authorize(['ADMIN', 'HR']),
    salaryController.getAllComponents
);

// Employee Structure (HR/Admin only)
router.post(
    '/structure/:employeeId',
    authenticate,
    authorize(['ADMIN', 'HR']),
    validateRequest(updateStructureSchema),
    salaryController.updateEmployeeStructure
);

router.get(
    '/structure/:employeeId',
    authenticate,
    authorize(['ADMIN', 'HR', 'EMPLOYEE']), // Employees can see their own structure? maybe.
    salaryController.getEmployeeStructure
);

export default router;
