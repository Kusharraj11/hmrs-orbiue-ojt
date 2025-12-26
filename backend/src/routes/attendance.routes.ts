import { Router } from 'express';
import { AttendanceController } from '../controllers/attendance.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { clockInSchema, clockOutSchema, attendanceSearchSchema, ingestSchema, processDailySchema, regularizeSchema } from '../validations/attendance.validation';

const router = Router();
const attendanceController = new AttendanceController();

router.post(
    '/ingest',
    validateRequest(ingestSchema),
    attendanceController.ingest
);

router.put(
    '/:id/regularize',
    validateRequest(regularizeSchema),
    attendanceController.regularize
);

router.post(
    '/process',
    validateRequest(processDailySchema),
    attendanceController.process
);

router.post(
    '/clock-in',
    validateRequest(clockInSchema),
    attendanceController.clockIn
);

router.post(
    '/clock-out',
    validateRequest(clockOutSchema),
    attendanceController.clockOut
);

router.get(
    '/',
    validateRequest(attendanceSearchSchema),
    attendanceController.getAllAttendance
);

export default router;
