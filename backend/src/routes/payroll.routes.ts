import { Router } from 'express';
import { PayrollController } from '../controllers/payroll.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
const payrollController = new PayrollController();

// Admin: Run Payroll
router.post(
    '/run',
    authenticate,
    authorize(['ADMIN', 'HR']),
    payrollController.runPayroll
);

// Employee: Get My Payslips
router.get(
    '/me',
    authenticate,
    payrollController.getMyPayslips
);

// Employee/Admin: Download PDF
router.get(
    '/:id/download',
    authenticate,
    payrollController.downloadPayslip
);

export default router;
