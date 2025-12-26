import request from 'supertest';
import app from '../app';
import prisma from '../config/prisma';
import { LeaveType, LeaveStatus, AttendanceStatus, PayrollStatus } from '@prisma/client';

describe('HRMS Full System Validation', () => {
    let employeeId: string;
    let token: string; // If we had auth

    const cleanup = async () => {
        if (employeeId) {
            try {
                await prisma.payroll.deleteMany({ where: { employeeId } });
                await prisma.attendance.deleteMany({ where: { employeeId } });
                await prisma.leaveRequest.deleteMany({ where: { employeeId } });
                await prisma.leaveBalance.deleteMany({ where: { employeeId } });
                await prisma.employee.delete({ where: { id: employeeId } });
            } catch (e) {
                // Ignore
            }
        }
    };

    afterAll(async () => {
        await cleanup();
        await prisma.$disconnect();
    });

    it('Scenario: Complete Employee Lifecycle', async () => {
        // 1. Hire Employee (HR)
        const hireRes = await request(app).post('/api/employees').send({
            firstName: 'System',
            lastName: 'User',
            email: `system.user.${Date.now()}@example.com`,
            phone: '1234567890',
            designation: 'Engineer',
            department: 'IT',
            joiningDate: new Date().toISOString(),
            salary: 100000
        });
        expect(hireRes.status).toBe(201);
        employeeId = hireRes.body.data.id;
        expect(employeeId).toBeDefined();

        // 2. Employee Applied for Leave
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 1);

        const leaveRes = await request(app).post('/api/leaves').send({
            employeeId,
            leaveType: 'SICK',
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            reason: 'Flu symptom'
        });
        if (leaveRes.status !== 201) {
            console.error('Leave creation failed:', JSON.stringify(leaveRes.body, null, 2));
        }
        expect(leaveRes.status).toBe(201);
        const leaveId = leaveRes.body.data.id;

        // 3. HR Approves Leave
        const approveRes = await request(app).patch(`/api/leaves/${leaveId}/status`).send({
            status: 'APPROVED',
            approverId: employeeId // Self-approve or use valid UUID
        });
        expect(approveRes.status).toBe(200);
        expect(approveRes.body.data.status).toBe('APPROVED');

        // 4. Employee Clocks In (Next Day logic simulated independently)
        const clockInRes = await request(app).post('/api/attendance/clock-in').send({
            employeeId
        });
        expect(clockInRes.status).toBe(201);

        // 5. Employee Clocks Out
        const clockOutRes = await request(app).post('/api/attendance/clock-out').send({
            employeeId
        });
        expect(clockOutRes.status).toBe(200);
        expect(clockOutRes.body.data.status).toBe('ABSENT'); // < 4 hours

        // 6. Generate Payroll for the Month
        const payrollRes = await request(app).post('/api/payroll/process').send({
            employeeId,
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear()
        });
        expect(payrollRes.status).toBe(201);
        const netSalary = payrollRes.body.data.netSalary;

        // Validation: 100k Basic - 12% PF (12k) - 5% Tax (5k) = 83k (+/- float precision)
        // 100000 - 17000 = 83000
        expect(Number(netSalary)).toBeCloseTo(83000);

        // 7. Check Dashboard Reports
        const reportRes = await request(app).get('/api/reports/dashboard');
        expect(reportRes.status).toBe(200);
        expect(reportRes.body.data.totalEmployees).toBeGreaterThan(0);
    });
});
