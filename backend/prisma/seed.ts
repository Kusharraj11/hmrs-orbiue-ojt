import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('password123', 10);

    // 1. Admin (No Employee record needed for pure Admin, but let's link one for consistency if schema requires)
    // Schema says: user.employee is optional.

    // Create Admin User
    await prisma.user.upsert({
        where: { email: 'admin@company.com' },
        update: {},
        create: {
            email: 'admin@company.com',
            password,
            role: 'ADMIN'
        }
    });

    // 2. HR (Needs Employee record)
    await prisma.employee.create({
        data: {
            firstName: 'HR',
            lastName: 'Manager',
            email: 'hr@company.com',
            phone: '9999999999',
            designation: 'HR Manager',
            department: 'HR',
            joiningDate: new Date(),
            salary: 60000,
            user: {
                create: {
                    email: 'hr@company.com',
                    password,
                    role: 'HR'
                }
            }
        }
    });

    // 3. Employee
    await prisma.employee.create({
        data: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'emp@company.com',
            phone: '8888888888',
            designation: 'Software Engineer',
            department: 'IT',
            joiningDate: new Date(),
            salary: 50000,
            user: {
                create: {
                    email: 'emp@company.com',
                    password,
                    role: 'EMPLOYEE'
                }
            }
        }
    });

    console.log('Seeding completed: Admin, HR, Employee created with password123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
