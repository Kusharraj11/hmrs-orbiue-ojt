import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app: Application = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

import employeeRoutes from './routes/employee.routes';
import leaveRoutes from './routes/leave.routes';
import attendanceRoutes from './routes/attendance.routes';
import payrollRoutes from './routes/payroll.routes';
import reportingRoutes from './routes/reporting.routes';
import authRoutes from './routes/auth.routes';
import departmentRoutes from './routes/department.routes';
import leavePolicyRoutes from './routes/policy.routes';
import holidayRoutes from './routes/holiday.routes';
import salaryRoutes from './routes/salary.routes';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/leave-policies', leavePolicyRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/salary', salaryRoutes); // Config
app.use('/api/payroll', payrollRoutes); // Run & Payslips
app.use('/api/reports', reportingRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Root Route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Employee Management API is running successfully.'
  });
});


// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app;
