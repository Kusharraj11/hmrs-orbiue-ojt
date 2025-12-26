import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
};

export const clockIn = async () => {
    const response = await axios.post(`${API_URL}/attendance/clock-in`, {}, getAuthHeader());
    return response.data;
};

export const clockOut = async () => {
    const response = await axios.post(`${API_URL}/attendance/clock-out`, {}, getAuthHeader());
    return response.data;
};

export const getAttendanceHistory = async (params: any = {}) => {
    const response = await axios.get(`${API_URL}/attendance`, {
        ...getAuthHeader(),
        params
    });
    return response.data;
};
