import { Router } from 'express';
import { LeaveController } from '../controllers/leave.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { createLeaveSchema, updateLeaveStatusSchema, leaveSearchSchema } from '../validations/leave.validation';

const router = Router();
const leaveController = new LeaveController();

router.post(
    '/',
    validateRequest(createLeaveSchema),
    leaveController.applyLeave
);

router.get(
    '/',
    validateRequest(leaveSearchSchema),
    leaveController.getAllLeaves
);

router.get(
    '/:id',
    leaveController.getLeaveById
);

router.patch(
    '/:id/status',
    validateRequest(updateLeaveStatusSchema),
    leaveController.updateLeaveStatus
);

export default router;
