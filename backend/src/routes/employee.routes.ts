import { Router } from 'express';
import { EmployeeController } from '../controllers/employee.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { createEmployeeSchema, updateEmployeeSchema, searchEmployeeSchema } from '../validations/employee.validation';

const router = Router();
const employeeController = new EmployeeController();

// Create Employee
router.post(
    '/',
    validateRequest(createEmployeeSchema),
    employeeController.createEmployee
);

// Get All Employees (Paginated & Filtered)
router.get(
    '/',
    validateRequest(searchEmployeeSchema),
    employeeController.getAllEmployees
);

// Get Single Employee
router.get(
    '/:id', // We could add a simple regex validator here if needed, but schema handles it better if we put params validations
    // note: updateEmployeeSchema has id validation in params. we can reuse or make a specific one.
    // for simplicity, let's rely on UUID check in controller or add a simple middleware.
    employeeController.getEmployeeById
);

// Update Employee
router.put(
    '/:id',
    validateRequest(updateEmployeeSchema),
    employeeController.updateEmployee
);

// Delete Employee (Soft Delete)
router.delete(
    '/:id',
    employeeController.deleteEmployee
);

export default router;
