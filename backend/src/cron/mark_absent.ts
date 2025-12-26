import prisma from '../config/prisma';
import { AttendanceStatus } from '@prisma/client';

async function markAbsentForToday() {
    console.log("Starting Auto-Absent Job...");

    // 1. Get all Active Employees
    const employees = await prisma.employee.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true, firstName: true }
    });

    console.log(`Found ${employees.length} active employees.`);

    const todayStr = new Date().toISOString().split('T')[0];
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    let absentCount = 0;

    for (const emp of employees) {
        // 2. Check if Attendance exists
        const existing = await prisma.attendance.findFirst({
            where: {
                employeeId: emp.id,
                date: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            }
        });

        if (!existing) {
            // 3. Create ABSENT record
            await prisma.attendance.create({
                data: {
                    employeeId: emp.id,
                    date: new Date(),
                    status: AttendanceStatus.ABSENT,
                    remarks: 'System Auto-Absent (No Punch Found)',
                    isManual: false
                }
            });
            console.log(` मार्ked ABSENT: ${emp.firstName} (${emp.id})`);
            absentCount++;
        }
    }

    console.log(`Job Complete. Marked ${absentCount} employees as Absent.`);
}

markAbsentForToday()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
