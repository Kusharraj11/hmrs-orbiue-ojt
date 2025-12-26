
import { Router } from 'express';
import { ReportingController } from '../controllers/reporting.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();
const reportingController = new ReportingController();

// All reports require Auth. Most require Admin/HR role.
router.use(authenticate);
router.use(authorize([Role.ADMIN, Role.HR]));

router.get('/dashboard', reportingController.getDashboardStats);
router.get('/leave-liability', reportingController.getLeaveLiability);
router.get('/leave-liability/download', reportingController.downloadLeaveLiability);
router.get('/attendance-anomalies', reportingController.getAttendanceAnomalies);

export default router;
