import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
};

export const applyLeave = async (data: any) => {
    const response = await axios.post(`${API_URL}/leaves`, data, getAuthHeader());
    return response.data;
};

export const getMyLeaves = async (employeeId: string) => {
    // Backend filter uses employeeId query param
    const response = await axios.get(`${API_URL}/leaves`, {
        ...getAuthHeader(),
        params: { employeeId }
    });
    return response.data;
};
