import { Request, Response, NextFunction } from 'express';
import { DepartmentService } from '../services/department.service';

const service = new DepartmentService();

export const createDepartment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const department = await service.createDepartment(req.body.name);
        res.status(201).json({ status: 'success', data: department });
    } catch (error) {
        next(error);
    }
};

export const getDepartments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const departments = await service.getAllDepartments();
        res.status(200).json({ status: 'success', data: departments });
    } catch (error) {
        next(error);
    }
};

export const deleteDepartment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await service.deleteDepartment(req.params.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
