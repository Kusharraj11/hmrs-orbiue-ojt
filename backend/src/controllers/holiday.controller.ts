import { Request, Response, NextFunction } from 'express';
import { HolidayService } from '../services/holiday.service';
import { z } from 'zod';

const holidayService = new HolidayService();

export class HolidayController {

    async createHoliday(req: Request, res: Response, next: NextFunction) {
        try {
            const schema = z.object({
                name: z.string().min(2),
                date: z.string().datetime({ offset: true }), // ISO String
                isRecurring: z.boolean().optional().default(true)
            });

            const data = await schema.parseAsync(req.body);
            const holiday = await holidayService.createHoliday({
                ...data,
                date: new Date(data.date)
            });

            res.status(201).json({ status: 'success', data: holiday });
        } catch (error) {
            next(error);
        }
    }

    async getAllHolidays(req: Request, res: Response, next: NextFunction) {
        try {
            const holidays = await holidayService.getAllHolidays();
            res.status(200).json({ status: 'success', data: holidays });
        } catch (error) {
            next(error);
        }
    }

    async deleteHoliday(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await holidayService.deleteHoliday(id);
            res.status(200).json({ status: 'success', message: 'Holiday deleted' });
        } catch (error) {
            next(error);
        }
    }
}
