import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
};

// --- Salary Components ---
export const getSalaryComponents = async () => {
    const response = await axios.get(`${API_URL}/salary/components`, getAuthHeader());
    return response.data;
};

export const createSalaryComponent = async (data: any) => {
    const response = await axios.post(`${API_URL}/salary/components`, data, getAuthHeader());
    return response.data;
};

export const getEmployeeStructure = async (employeeId: string) => {
    const response = await axios.get(`${API_URL}/salary/structure/${employeeId}`, getAuthHeader());
    return response.data;
};

export const updateEmployeeStructure = async (employeeId: string, components: any[]) => {
    const response = await axios.post(`${API_URL}/salary/structure/${employeeId}`, { components }, getAuthHeader());
    return response.data;
};

// --- Payroll Runs ---
export const runPayroll = async (month: number, year: number) => {
    const response = await axios.post(`${API_URL}/payroll/run`, { month, year }, getAuthHeader());
    return response.data;
};

// --- Payslips ---
export const getMyPayslips = async () => {
    const response = await axios.get(`${API_URL}/payroll/me`, getAuthHeader());
    return response.data;
};

export const downloadPayslip = async (id: string, filename: string) => {
    const response = await axios.get(`${API_URL}/payroll/${id}/download`, {
        ...getAuthHeader(),
        responseType: 'blob', // Important for file download
    });

    // Trigger download in browser
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
};
