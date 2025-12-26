import { Router } from 'express';
import { LeavePolicyController } from '../controllers/policy.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
const controller = new LeavePolicyController();

// Only HR and ADMIN can manage policies
// Assuming 'HR' role includes Admin privileges for policies, or we strict it to ADMIN
// Based on plan: "As an HR Admin..." so HR + ADMIN
router.use(authenticate, authorize(['ADMIN', 'HR']));

router.post('/', controller.createPolicy);
router.get('/', controller.getAllPolicies);
router.put('/:id', controller.updatePolicy);
router.delete('/:id', controller.deletePolicy);

export default router;
