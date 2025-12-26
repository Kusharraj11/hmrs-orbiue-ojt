import { Request, Response, NextFunction } from 'express';
import { LeavePolicyService } from '../services/policy.service';
import { z } from 'zod';
import { LeaveType } from '@prisma/client';

const policyService = new LeavePolicyService();

export class LeavePolicyController {

    async createPolicy(req: Request, res: Response, next: NextFunction) {
        try {
            const schema = z.object({
                leaveType: z.nativeEnum(LeaveType),
                maxDaysPerYear: z.number().int().positive(),
                carryForwardLimit: z.number().int().min(0)
            });

            const data = await schema.parseAsync(req.body);
            const policy = await policyService.createPolicy(data);

            res.status(201).json({ status: 'success', data: policy });
        } catch (error) {
            next(error);
        }
    }

    async getAllPolicies(req: Request, res: Response, next: NextFunction) {
        try {
            const policies = await policyService.getAllPolicies();
            res.status(200).json({ status: 'success', data: policies });
        } catch (error) {
            next(error);
        }
    }

    async updatePolicy(req: Request, res: Response, next: NextFunction) {
        try {
            const schema = z.object({
                maxDaysPerYear: z.number().int().positive().optional(),
                carryForwardLimit: z.number().int().min(0).optional()
            });

            const { id } = req.params;
            const data = await schema.parseAsync(req.body);
            const policy = await policyService.updatePolicy(id, data);

            res.status(200).json({ status: 'success', data: policy });
        } catch (error) {
            next(error);
        }
    }

    async deletePolicy(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await policyService.deletePolicy(id);
            res.status(200).json({ status: 'success', message: 'Policy deleted' });
        } catch (error) {
            next(error);
        }
    }
}
