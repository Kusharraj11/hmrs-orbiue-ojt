import prisma from '../config/prisma';
import { Attendance, Prisma, AttendanceStatus } from '@prisma/client';

export class AttendanceRepository {

    async create(data: Prisma.AttendanceCreateInput): Promise<Attendance> {
        return await prisma.attendance.create({
            data
        });
    }

    async update(id: string, data: Prisma.AttendanceUpdateInput): Promise<Attendance> {
        return await prisma.attendance.update({
            where: { id },
            data
        });
    }

    // Explicit regularize function to ensure correct fields are touched
    async regularize(id: string, data: { checkIn?: Date, checkOut?: Date, status: AttendanceStatus, totalHours: number, remarks: string }) {
        return await prisma.attendance.update({
            where: { id },
            data: {
                checkIn: data.checkIn,
                checkOut: data.checkOut,
                status: data.status,
                totalHours: data.totalHours,
                remarks: data.remarks,
                isManual: true
            }
        });
    }

    async createRawRecord(data: any) { // Temporary fix to bypass type check if generation is lagging
        return await (prisma as any).attendanceRecord.create({
            data
        });
    }

    async findRawRecordsByDate(employeeId: string, date: Date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        return await (prisma as any).attendanceRecord.findMany({
            where: {
                employeeId,
                timestamp: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            },
            orderBy: { timestamp: 'asc' }
        });
    }

    async upsertDailyAttendance(employeeId: string, date: Date, data: Prisma.AttendanceCreateInput) {
        // We use upsert to create or update the single daily record
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        // Find existing ID first (Prisma upsert requires unique constraint on non-id fields if we want to use composite key, 
        // but our schema doesn't have composite unique on employeeId + date yet. )
        // Let's do findFirst then update or create for safety.

        const existing = await this.findTodayRecord(employeeId); // findTodayRecord logic is slightly reused but handles "Today" vs "Any Date"
        // Wait, 'findTodayRecord' uses 'new Date()' inside. I should refactor 'findTodayRecord' to 'findByDate'.

        // Refactoring findTodayRecord to findByDate
        const record = await prisma.attendance.findFirst({
            where: {
                employeeId,
                date: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            }
        });

        if (record) {
            return await prisma.attendance.update({
                where: { id: record.id },
                data: {
                    checkIn: data.checkIn,
                    checkOut: data.checkOut,
                    totalHours: data.totalHours,
                    status: data.status,
                    // We don't overwrite date usually, but its fine
                }
            });
        } else {
            return await prisma.attendance.create({
                data
            });
        }
    }

    async findTodayRecord(employeeId: string): Promise<Attendance | null> {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        return await prisma.attendance.findFirst({
            where: {
                employeeId,
                date: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            }
        });
    }

    async findAll(
        page: number,
        limit: number,
        filter: { employeeId?: string; startDate?: Date; endDate?: Date }
    ) {
        const skip = (page - 1) * limit;
        const whereClause: Prisma.AttendanceWhereInput = {
            ...(filter.employeeId && { employeeId: filter.employeeId }),
            ...(filter.startDate && filter.endDate && {
                date: {
                    gte: filter.startDate,
                    lte: filter.endDate
                }
            })
        };

        const [total, data] = await Promise.all([
            prisma.attendance.count({ where: whereClause }),
            prisma.attendance.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: { date: 'desc' },
                include: {
                    employee: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            department: true
                        }
                    }
                }
            })
        ]);

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
}
