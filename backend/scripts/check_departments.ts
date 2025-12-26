import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Checking Departments in Database...");
    const departments = await prisma.department.findMany();
    console.log(departments);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
