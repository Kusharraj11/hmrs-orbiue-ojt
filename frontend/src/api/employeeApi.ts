import client from './client';

export const getEmployees = async () => {
    const res = await client.get('/employees');
    return res.data;
};

export const getEmployeeById = async (id: string) => {
    const res = await client.get(`/employees/${id}`);
    return res.data;
};

export const createEmployee = async (data: any) => {
    const res = await client.post('/employees', data);
    return res.data;
};

export const updateEmployee = async (id: string, data: any) => {
    const res = await client.put(`/employees/${id}`, data);
    return res.data;
};
