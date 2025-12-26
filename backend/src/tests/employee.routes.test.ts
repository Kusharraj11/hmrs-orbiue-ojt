import request from 'supertest';
import app from '../app';
import prisma from '../config/prisma';

describe('Employee API End-to-End Tests', () => {
    let createdEmployeeId: string;

    // Clean up before and after tests
    const cleanup = async () => {
        // Warning: This deletes data. Best to use a separate test DB.
        // For now we will delete specifically the ones we created if possible, 
        // or just accept we are testing on dev DB.
        // Strategy: Verify exact creation and use the ID to cleanup.
        if (createdEmployeeId) {
            try {
                await prisma.employee.delete({ where: { id: createdEmployeeId } });
            } catch (e) {
                // Ignore if already deleted
            }
        }
    };

    afterAll(async () => {
        await cleanup();
        await prisma.$disconnect();
    });

    it('should create a new employee', async () => {
        const response = await request(app)
            .post('/api/employees')
            .send({
                firstName: 'Test',
                lastName: 'User',
                email: `test.user.${Date.now()}@example.com`,
                phone: '1234567890',
                designation: 'Tester',
                department: 'QA',
                joiningDate: new Date().toISOString(),
                salary: 50000
            });

        expect(response.status).toBe(201);
        expect(response.body.status).toBe('success');
        expect(response.body.data.email).toContain('test.user');

        createdEmployeeId = response.body.data.id;
    });

    it('should get all employees', async () => {
        const response = await request(app).get('/api/employees');
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should get employee by ID', async () => {
        if (!createdEmployeeId) return; // Skip if creation failed

        const response = await request(app).get(`/api/employees/${createdEmployeeId}`);
        expect(response.status).toBe(200);
        expect(response.body.data.id).toBe(createdEmployeeId);
    });

    it('should update employee', async () => {
        if (!createdEmployeeId) return;

        const response = await request(app)
            .put(`/api/employees/${createdEmployeeId}`)
            .send({
                designation: 'Senior Tester'
            });

        expect(response.status).toBe(200);
        expect(response.body.data.designation).toBe('Senior Tester');
    });

    it('should delete employee', async () => {
        if (!createdEmployeeId) return;

        const response = await request(app).delete(`/api/employees/${createdEmployeeId}`);
        expect(response.status).toBe(200);

        // Verify deletion (Soft Delete check)
        const check = await request(app).get(`/api/employees/${createdEmployeeId}`);
        expect(check.status).toBe(200);
        expect(check.body.data.status).toBe('TERMINATED');
    });
});
