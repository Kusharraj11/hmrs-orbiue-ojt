import { DepartmentRepository } from '../repositories/department.repository';
import { AppError } from '../middlewares/error/AppError';

export class DepartmentService {
    private repo: DepartmentRepository;

    constructor() {
        this.repo = new DepartmentRepository();
    }

    async createDepartment(name: string) {
        if (!name) throw new AppError('Department name is required', 400);
        return await this.repo.create(name);
    }

    async getAllDepartments() {
        return await this.repo.findAll();
    }

    async deleteDepartment(id: string) {
        return await this.repo.delete(id);
    }
}
