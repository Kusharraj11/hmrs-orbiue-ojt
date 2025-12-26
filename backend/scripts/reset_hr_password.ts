import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'hr@company.com';
    const newPassword = 'password123';

    console.log(`Resetting password for ${email}...`);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    try {
        const user = await prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        });
        console.log(`Success! Password for ${user.email} has been reset to: ${newPassword}`);
    } catch (error) {
        console.error("Failed to update user. User might not exist or other error.");
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
