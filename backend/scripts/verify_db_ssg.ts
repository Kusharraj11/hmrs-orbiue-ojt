
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function verify() {
    console.log("Verifying SSG Data...");

    // 1. Check Runs
    const runs = await prisma.payrollRun.findMany({ orderBy: { createdAt: 'desc' }, take: 1 });
    if (runs.length === 0) {
        console.log("❌ No Payroll Runs found.");
        return;
    }
    const latestRun = runs[0];
    console.log(`✅ Latest Run: ${latestRun.month}/${latestRun.year} (ID: ${latestRun.id})`);

    // 2. Check Payslips
    const slips = await prisma.payslip.findMany({
        where: { payrollRunId: latestRun.id },
        include: { employee: true }
    });

    console.log(`✅ Found ${slips.length} payslips in this run.`);

    if (slips.length > 0) {
        const slip = slips[0];
        console.log(`   - Employee: ${slip.employee.firstName} ${slip.employee.lastName}`);
        console.log(`   - Net Pay: ${slip.netPay}`);
        console.log(`   - PDF Path: ${slip.pdfPath}`);

        if (slip.pdfPath && fs.existsSync(slip.pdfPath)) {
            console.log("   ✅ PDF File exists on disk.");
        } else {
            console.error("   ❌ PDF File MISSING on disk.");
        }
    }
}

verify()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
