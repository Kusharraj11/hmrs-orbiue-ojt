const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Reset Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@company.com' },
        update: { password: hashedPassword, role: 'ADMIN' },
        create: {
            email: 'admin@company.com',
            password: hashedPassword,
            role: 'ADMIN'
        }
    });
    console.log('Reset Admin:', admin.email);

    // Reset HR
    const hr = await prisma.user.upsert({
        where: { email: 'hr@company.com' },
        update: { password: hashedPassword, role: 'HR' },
        create: {
            email: 'hr@company.com',
            password: hashedPassword,
            role: 'HR'
        }
    });
    // Reset Employee User
    const empHashed = await bcrypt.hash('employee123', salt);
    const emp = await prisma.user.upsert({
        where: { email: 'emp@company.com' },
        update: { password: empHashed, role: 'EMPLOYEE' },
        create: {
            email: 'emp@company.com',
            password: empHashed,
            role: 'EMPLOYEE'
        }
    });

    console.log('Password reset successful for:');
    console.log('- Admin: admin@company.com / admin123');
    console.log('- HR: hr@company.com / admin123');
    console.log('- Employee: emp@company.com / employee123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
