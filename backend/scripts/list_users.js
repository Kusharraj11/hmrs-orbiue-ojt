const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.employee.findMany({
        select: {
            id: true,
            email: true,
            role: true,
            password: true // We can't see the plain password, but we can see if it's set
        }
    });
    console.log('Existing Users:', users);
}

main()
    .catch((e) => {
        throw e;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
