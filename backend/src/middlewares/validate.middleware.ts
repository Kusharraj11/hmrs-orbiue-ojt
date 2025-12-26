import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const validateRequest = (schema: z.Schema) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            return next();
        } catch (error) {
            if (error instanceof ZodError) {
                const issues = (error as any).errors || [];
                return res.status(400).json({
                    status: 'error',
                    message: 'Validation failed',
                    errors: issues.map((e: any) => ({
                        field: e.path.join('.'),
                        message: e.message,
                    })),
                });
            }
            return next(error);
        }
    };
