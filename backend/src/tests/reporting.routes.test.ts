import request from 'supertest';
import app from '../app';
import prisma from '../config/prisma';
import { LeaveStatus, AttendanceStatus, PayrollStatus, LeaveType } from '@prisma/client';

describe('Reporting Module End-to-End Tests', () => {
    let employeeId: string;

    const cleanup = async () => {
        if (employeeId) {
            try {
                await prisma.payroll.deleteMany({ where: { employeeId } });
                await prisma.attendance.deleteMany({ where: { employeeId } });
                await prisma.leaveRequest.deleteMany({ where: { employeeId } });
                await prisma.leaveBalance.deleteMany({ where: { employeeId } });
                await prisma.employee.delete({ where: { id: employeeId } });
            } catch (e) {
                // ignore
            }
        }
    };

    afterAll(async () => {
        await cleanup();
        await prisma.$disconnect();
    });

    it('should create data for reporting tests', async () => {
        // 1. Create Employee
        const empRes = await request(app).post('/api/employees').send({
            firstName: 'Report',
            lastName: 'Tester',
            email: `report.tester.${Date.now()}@example.com`,
            phone: '7766554433',
            designation: 'Analyst',
            department: 'Data',
            joiningDate: new Date().toISOString(),
            salary: 50000
        });
        expect(empRes.status).toBe(201);
        employeeId = empRes.body.data.id;

        // 2. Create Pending Leave
        await prisma.leaveRequest.create({
            data: {
                employeeId,
                leaveType: LeaveType.SICK,
                startDate: new Date(),
                endDate: new Date(),
                reason: 'Test Leave',
                status: LeaveStatus.PENDING
            }
        });

        // 3. Create Today's Attendance
        await prisma.attendance.create({
            data: {
                employeeId,
                date: new Date(),
                checkIn: new Date(),
                status: AttendanceStatus.PRESENT
            }
        });

        // 4. Create Payroll for this month
        await prisma.payroll.create({
            data: {
                employeeId,
                month: new Date().getMonth() + 1,
                year: new Date().getFullYear(),
                basicSalary: 50000,
                allowances: 0,
                deductions: 5000,
                netSalary: 45000,
                status: PayrollStatus.PAID
            }
        });
    });

    it('should get dashboard stats', async () => {
        const res = await request(app).get('/api/reports/dashboard');
        expect(res.status).toBe(200);
        const data = res.body.data;

        expect(data.totalEmployees).toBeGreaterThanOrEqual(1);
        expect(data.pendingLeaves).toBeGreaterThanOrEqual(1);
        expect(data.todayAttendance.present).toBeGreaterThanOrEqual(1);
    });

    it('should get attendance report', async () => {
        const res = await request(app).get('/api/reports/attendance');
        expect(res.status).toBe(200);
        expect(res.body.data.breakdown).toBeDefined();
        // Should have at least one PRESENT
        const present = res.body.data.breakdown.find((b: any) => b.status === 'PRESENT');
        expect(present).toBeDefined();
        expect(present.count).toBeGreaterThanOrEqual(1);
    });

    it('should get payroll report', async () => {
        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();
        const res = await request(app).get(`/api/reports/payroll?month=${month}&year=${year}`);

        expect(res.status).toBe(200);
        const data = res.body.data;
        expect(Number(data.totalDisbursed)).toBeGreaterThanOrEqual(45000);
        expect(data.totalProcessed).toBeGreaterThanOrEqual(1);
    });
});
