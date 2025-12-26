import request from 'supertest';
import app from '../app';
import prisma from '../config/prisma';
import { LeaveType, LeaveStatus } from '@prisma/client';

describe('Leave Module End-to-End Tests', () => {
    let employeeId: string;
    let leaveRequestId: string;

    // Cleanup function
    const cleanup = async () => {
        if (employeeId) {
            try {
                // Delete things related to employee
                await prisma.leaveRequest.deleteMany({ where: { employeeId } });
                await prisma.leaveBalance.deleteMany({ where: { employeeId } });
                await prisma.employee.delete({ where: { id: employeeId } });
            } catch (error) {
                // Ignore
            }
        }
    };

    afterAll(async () => {
        await cleanup();
        await prisma.$disconnect();
    });

    it('should create an employee for testing', async () => {
        const res = await request(app).post('/api/employees').send({
            firstName: 'Leave',
            lastName: 'Tester',
            email: `leave.tester.${Date.now()}@example.com`,
            phone: '1122334455',
            designation: 'Tester',
            department: 'QA',
            joiningDate: new Date().toISOString(),
            salary: 40000
        });
        expect(res.status).toBe(201);
        employeeId = res.body.data.id;
    });

    it('should apply for leave (auto-initialize balance)', async () => {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 2); // 3 days total

        const res = await request(app).post('/api/leaves').send({
            employeeId,
            leaveType: LeaveType.SICK,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            reason: 'Feeling unwell'
        });

        expect(res.status).toBe(201);
        expect(res.body.data.status).toBe(LeaveStatus.PENDING);
        leaveRequestId = res.body.data.id;

        // Verify Balance was created (default 12 SICK)
        const balance = await prisma.leaveBalance.findFirst({ where: { employeeId } });
        expect(balance).not.toBeNull();
        expect(balance?.sickLeave).toBe(12); // Default
    });

    it('should approve leave and deduct balance', async () => {
        const res = await request(app).patch(`/api/leaves/${leaveRequestId}/status`).send({
            status: LeaveStatus.APPROVED,
            approverId: employeeId // Self-approving for test simplicity, though usually different
        });

        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe(LeaveStatus.APPROVED);

        // Verify Balance Deduction (3 days)
        const balance = await prisma.leaveBalance.findFirst({ where: { employeeId } });
        expect(balance?.sickLeave).toBe(9); // 12 - 3 = 9
    });

    it('should reject leave without deducting balance', async () => {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 1); // 2 days

        // Create new request
        const createRes = await request(app).post('/api/leaves').send({
            employeeId,
            leaveType: LeaveType.CASUAL,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            reason: 'Personal work'
        });
        const newLeaveId = createRes.body.data.id;

        // Reject
        const res = await request(app).patch(`/api/leaves/${newLeaveId}/status`).send({
            status: LeaveStatus.REJECTED,
            rejectionReason: 'Not approved'
        });

        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe(LeaveStatus.REJECTED);

        // Verify Balance (Default 12 CASUAL, should NOT change)
        const balance = await prisma.leaveBalance.findFirst({ where: { employeeId } });
        expect(balance?.casualLeave).toBe(12);
    });
});
