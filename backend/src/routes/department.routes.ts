import { Router } from 'express';
import { createDepartment, getDepartments, deleteDepartment } from '../controllers/department.controller';

const router = Router();

router.get('/', getDepartments);
router.post('/', createDepartment);
router.delete('/:id', deleteDepartment);

export default router;
