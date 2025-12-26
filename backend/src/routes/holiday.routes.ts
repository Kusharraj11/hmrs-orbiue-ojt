import { Router } from 'express';
import { HolidayController } from '../controllers/holiday.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
const controller = new HolidayController();

router.use(authenticate, authorize(['ADMIN', 'HR']));

router.post('/', controller.createHoliday);
router.get('/', controller.getAllHolidays);
router.delete('/:id', controller.deleteHoliday);

export default router;
