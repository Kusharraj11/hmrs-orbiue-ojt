import prisma from '../config/prisma';

export class DepartmentRepository {
    async create(name: string) {
        return await prisma.department.create({ data: { name } });
    }

    async findAll() {
        return await prisma.department.findMany({ orderBy: { name: 'asc' } });
    }

    async delete(id: string) {
        return await prisma.department.delete({ where: { id } });
    }
}
