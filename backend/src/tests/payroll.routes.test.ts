import request from 'supertest';
import app from '../app';
import prisma from '../config/prisma';

describe('Payroll Module End-to-End Tests', () => {
    let employeeId: string;
    const baseSalary = 50000;
    // Expected values based on constants in service:
    // PF = 12% = 6000
    // Tax = 5% = 2500
    // Total Deductions = 8500
    // Net Salary = 41500

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

    it('should create an employee for payroll testing', async () => {
        const res = await request(app).post('/api/employees').send({
            firstName: 'Payroll',
            lastName: 'Tester',
            email: `payroll.tester.${Date.now()}@example.com`,
            phone: '8877665544',
            designation: 'Accountant',
            department: 'Finance',
            joiningDate: new Date().toISOString(),
            salary: baseSalary
        });
        expect(res.status).toBe(201);
        employeeId = res.body.data.id;
    });

    it('should process payroll successfully', async () => {
        const res = await request(app).post('/api/payroll/process').send({
            employeeId,
            month: 10,
            year: 2024
        });

        expect(res.status).toBe(201);
        const data = res.body.data;
        expect(data.employeeId).toBe(employeeId);
        expect(Number(data.basicSalary)).toBe(baseSalary);

        // Verify Calculations
        const expectedPF = baseSalary * 0.12;
        const expectedTax = baseSalary * 0.05;
        const expectedDeductions = expectedPF + expectedTax;
        const expectedNet = baseSalary - expectedDeductions;

        expect(Number(data.deductions)).toBe(expectedDeductions);
        expect(Number(data.netSalary)).toBe(expectedNet);
        expect(data.status).toBe('PAID');
    });

    it('should prevent duplicate payroll for same month', async () => {
        const res = await request(app).post('/api/payroll/process').send({
            employeeId,
            month: 10, // Same month
            year: 2024
        });

        expect(res.status).toBe(500); // Or 400 depending on error handling, service throws Error -> 500
    });

    it('should retrieve payroll history', async () => {
        const res = await request(app).get(`/api/payroll?employeeId=${employeeId}`);
        expect(res.status).toBe(200);
        expect(res.body.data.length).toBeGreaterThan(0);
        expect(Number(res.body.data[0].netSalary)).toBe(41500);
    });
});
