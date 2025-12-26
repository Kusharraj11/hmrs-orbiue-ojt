
import prisma from '../config/prisma';
import { EmployeeStatus, LeaveStatus, AttendanceStatus } from '@prisma/client';

export class ReportingRepository {

    // --- Dashboard Metrics ---
    async getDashboardStats() {
        const totalEmployees = await prisma.employee.count({
            where: { status: EmployeeStatus.ACTIVE }
        });

        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const leaveToday = await prisma.leaveRequest.count({
            where: {
                status: LeaveStatus.APPROVED,
                startDate: { lte: endOfDay },
                endDate: { gte: startOfDay }
            }
        });

        const pendingLeaves = await prisma.leaveRequest.count({
            where: { status: LeaveStatus.PENDING }
        });

        const presentToday = await prisma.attendance.count({
            where: {
                date: { gte: startOfDay, lte: endOfDay },
                status: {
                    in: [AttendanceStatus.PRESENT, AttendanceStatus.HALF_DAY, AttendanceStatus.LATE]
                }
            }
        });

        return {
            totalEmployees,
            leaveToday,
            pendingLeaves,
            presentToday
        };
    }

    // --- Report: Leave Liability ---
    async getLeaveLiability(departmentId?: string) {
        // Fetch all active employees with their leave balances
        // If departmentId is provided, filter by it (joining Employee)
        const whereClause = {
            employee: {
                status: EmployeeStatus.ACTIVE,
                ...(departmentId ? { department: departmentId } : {}) // Note: department is currently a String in Employee, not IDs
            }
        };

        // Note: For liability, we need the Balance table
        // We will fetch balances and include employee details
        return await prisma.leaveBalance.findMany({
            where: whereClause,
            include: {
                employee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        department: true,
                        salary: true // Might need cost of liability later
                    }
                }
            }
        });
    }

    // --- Report: Attendance Anomalies ---
    async getAttendanceAnomalies(startDate: Date, endDate: Date) {
        return await prisma.attendance.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate
                },
                OR: [
                    { status: AttendanceStatus.LATE },
                    {
                        totalHours: { lt: 8 },
                        status: { not: AttendanceStatus.ABSENT } // Exclude full absent if we only want "short time"
                    }
                ]
            },
            include: {
                employee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        department: true
                    }
                }
            },
            orderBy: {
                date: 'desc'
            }
        });
    }
}
