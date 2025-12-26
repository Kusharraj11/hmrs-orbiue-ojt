import { AttendanceRepository } from '../repositories/attendance.repository';
import { AttendanceStatus } from '@prisma/client';

const attendanceRepository = new AttendanceRepository();

export class AttendanceService {

    async ingest(data: { employeeId: string; timestamp: string; type: 'IN' | 'OUT'; device?: string, latitude?: number, longitude?: number }) {

        // Geofencing Logic
        if (data.latitude && data.longitude) {
            const OFFICE_LAT = 12.9716; // Example (Bangalore)
            const OFFICE_LONG = 77.5946;
            const ALLOWED_RADIUS_METERS = 200;

            const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
                const R = 6371e3; // metres
                const φ1 = lat1 * Math.PI / 180;
                const φ2 = lat2 * Math.PI / 180;
                const Δφ = (lat2 - lat1) * Math.PI / 180;
                const Δλ = (lon2 - lon1) * Math.PI / 180;

                const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                    Math.cos(φ1) * Math.cos(φ2) *
                    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

                return R * c;
            }

            const distance = getDistance(data.latitude, data.longitude, OFFICE_LAT, OFFICE_LONG);
            console.log(`Geo Check: Dist ${distance.toFixed(2)}m from Office.`);

            if (distance > ALLOWED_RADIUS_METERS) {
                throw new Error(`Geofencing Violation: You are ${distance.toFixed(0)}m away from office. Must be within ${ALLOWED_RADIUS_METERS}m.`);
            }
        }

        // Here we could add logic to duplicate check specifically for raw logs if needed
        return await attendanceRepository.createRawRecord({
            employee: { connect: { id: data.employeeId } },
            timestamp: new Date(data.timestamp),
            type: data.type,
            device: data.device
        });
    }

    async processDailyAttendance(employeeId: string, dateStr: string) {
        const date = new Date(dateStr);
        const records = await attendanceRepository.findRawRecordsByDate(employeeId, date);

        if (records.length === 0) {
            // Logic: Mark as ABSENT if no records? Or maybe LEAVE?
            // For now, let's just return null or mark ABSENT.
            return { message: "No records found for this date", status: "SKIPPED" };
        }

        // Logic: First IN, Last OUT
        // We trust sorted by 'asc' from repository
        const firstRecord = records[0];
        const lastRecord = records[records.length - 1];

        let checkIn = firstRecord.type === 'IN' ? firstRecord.timestamp : null;
        let checkOut = lastRecord.type === 'OUT' ? lastRecord.timestamp : null;

        // Fallback: If only 1 record (IN), checkOut is null.
        // If only 1 record (OUT), checkIn is null (weird but possible).

        let totalHours = 0;
        let status: any = AttendanceStatus.ABSENT;

        if (checkIn && checkOut) {
            const diffMs = checkOut.getTime() - checkIn.getTime();
            totalHours = diffMs / (1000 * 60 * 60);

            // 1. Status Check
            if (totalHours >= 8) {
                status = AttendanceStatus.PRESENT;
            } else if (totalHours >= 4) {
                status = AttendanceStatus.HALF_DAY;
            } else {
                status = AttendanceStatus.ABSENT; // Present but very short duration
            }
        } else if (checkIn && !checkOut) {
            // Forgot Punch Out? 
            status = AttendanceStatus.ABSENT; // Or specialized status "MISSED_PUNCH" if we had it
        }

        // 2. Late Arrival Check
        // Policy: 9:30 AM
        if (checkIn) {
            const nineThirty = new Date(date);
            nineThirty.setHours(9, 30, 0, 0);

            // If checkIn is after 9:30 AND they worked enough to be present/half-day, mark as LATE?
            // Usually LATE is a flag, not a status replacement. 
            // Current Schema has Status Enum: PRESENT, ABSENT, HALF_DAY, LATE.
            // So LATE takes precedence? Or is it a separate flag?
            // Schema has `status AttendanceStatus`. So it's mutually exclusive.
            // Let's say if Present but Late -> LATE.
            if (checkIn > nineThirty && totalHours >= 4) {
                status = AttendanceStatus.LATE;
            }
        }

        return await attendanceRepository.upsertDailyAttendance(employeeId, date, {
            employee: { connect: { id: employeeId } },
            date: date,
            checkIn: checkIn || undefined, // Prisma Optional
            checkOut: checkOut || undefined,
            totalHours: totalHours,
            status: status
        });
    }

    async regularize(id: string, data: { checkIn: string; checkOut: string; remarks: string }) {
        const checkIn = new Date(data.checkIn);
        const checkOut = new Date(data.checkOut);

        // Recalculate based on new manual times
        const diffMs = checkOut.getTime() - checkIn.getTime();
        const totalHours = diffMs / (1000 * 60 * 60);

        // Re-evaluate Status (Manual override usually implies Present, but let's check hours)
        let status: any = AttendanceStatus.ABSENT;

        if (totalHours >= 8) {
            status = AttendanceStatus.PRESENT;
        } else if (totalHours >= 4) {
            status = AttendanceStatus.HALF_DAY;
        } else {
            status = AttendanceStatus.ABSENT; // Or Keep as is? Usually manual entry means "I was here"
            // But logic should hold.
        }

        // Late Check? 
        // If manager is overriding, do we enforce Late? 
        // Usually YES, unless they are correcting the In-Time specifically to remove Late.
        // Let's re-run standard late logic based on new CheckIn.

        // Need to know the date of the record to check 9:30 AM logic? 
        // We can infer date from checkIn object itself.
        const date = new Date(checkIn);
        const nineThirty = new Date(date);
        nineThirty.setHours(9, 30, 0, 0);

        if (checkIn > nineThirty && totalHours >= 4) {
            status = AttendanceStatus.LATE;
        }

        return await attendanceRepository.regularize(id, {
            checkIn,
            checkOut,
            status,
            totalHours,
            remarks: data.remarks
        });
    }

    async clockIn(data: any) {
        const { employeeId } = data;

        // Check if already clocked in today
        const existingRecord = await attendanceRepository.findTodayRecord(employeeId);
        if (existingRecord) {
            throw new Error('Employee already clocked in for today');
        }

        return await attendanceRepository.create({
            employee: { connect: { id: employeeId } },
            date: new Date(),
            checkIn: new Date(),
            status: AttendanceStatus.ABSENT // Default until clock out or end of day processing
        });
    }

    async clockOut(data: any) {
        const { employeeId } = data;

        // Check if clocked in
        const record = await attendanceRepository.findTodayRecord(employeeId);
        if (!record) {
            throw new Error('No clock-in record found for today');
        }

        if (record.checkOut) {
            throw new Error('Employee already clocked out for today');
        }

        if (!record.checkIn) {
            throw new Error('Invalid Check-in data');
        }

        const clockOutTime = new Date();
        const clockInTime = new Date(record.checkIn);

        // Calculate Total Hours
        const durationMs = clockOutTime.getTime() - clockInTime.getTime();
        const totalHours = durationMs / (1000 * 60 * 60);

        // Determine Status
        let status: any = AttendanceStatus.ABSENT;
        if (totalHours >= 8) {
            status = AttendanceStatus.PRESENT;
        } else if (totalHours >= 4) {
            status = AttendanceStatus.HALF_DAY;
        }

        return await attendanceRepository.update(record.id, {
            checkOut: clockOutTime,
            totalHours,
            status
        });
    }

    async getAllAttendance(page: number, limit: number, filters: any) {
        return await attendanceRepository.findAll(page, limit, filters);
    }
}
