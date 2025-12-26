import prisma from '../config/prisma';

export class HolidayService {
    async createHoliday(data: { name: string, date: Date, isRecurring: boolean }) {
        return await prisma.holiday.create({ data });
    }

    async getAllHolidays() {
        return await prisma.holiday.findMany({
            orderBy: { date: 'asc' }
        });
    }

    async deleteHoliday(id: string) {
        return await prisma.holiday.delete({ where: { id } });
    }
}
