import request from 'supertest';
import app from '../app';
import prisma from '../config/prisma';

describe('Attendance Module End-to-End Tests', () => {
    let employeeId: string;

    const cleanup = async () => {
        if (employeeId) {
            await prisma.attendance.deleteMany({ where: { employeeId } });
            await prisma.leaveRequest.deleteMany({ where: { employeeId } });
            await prisma.leaveBalance.deleteMany({ where: { employeeId } });
            await prisma.employee.delete({ where: { id: employeeId } });
        }
    };

    afterAll(async () => {
        await cleanup();
        await prisma.$disconnect();
    });

    it('should create an employee for testing', async () => {
        const res = await request(app).post('/api/employees').send({
            firstName: 'Attendance',
            lastName: 'Tester',
            email: `attendance.tester.${Date.now()}@example.com`,
            phone: '9988776655',
            designation: 'Tester',
            department: 'QA',
            joiningDate: new Date().toISOString(),
            salary: 45000
        });
        expect(res.status).toBe(201);
        employeeId = res.body.data.id;
    });

    it('should clock in successfully', async () => {
        const res = await request(app).post('/api/attendance/clock-in').send({
            employeeId
        });
        expect(res.status).toBe(201);
        expect(res.body.data.checkIn).toBeDefined();
        expect(res.body.data.status).toBe('ABSENT'); // Default
    });

    it('should prevent double clock in', async () => {
        const res = await request(app).post('/api/attendance/clock-in').send({
            employeeId
        });
        expect(res.status).toBe(500); // Or 400 depending on error handling logic
    });

    it('should clock out successfully', async () => {
        // Wait a small bit relative to system clock if needed, but for test usually unnecessary
        // unless we test duration.
        const res = await request(app).post('/api/attendance/clock-out').send({
            employeeId
        });
        expect(res.status).toBe(200);
        expect(res.body.data.checkOut).toBeDefined();
        // Since duration is < 4 hours (immediate), status should be ABSENT or maybe HALF_DAY 
        // depending on strict logic. The service says < 4 is ABSENT.
        expect(res.body.data.status).toBe('ABSENT');
    });

    it('should fetch attendance history', async () => {
        const res = await request(app).get(`/api/attendance?employeeId=${employeeId}`);
        expect(res.status).toBe(200);
        expect(res.body.data.length).toBeGreaterThan(0);
        expect(res.body.data[0].employeeId).toBe(employeeId);
    });
});
