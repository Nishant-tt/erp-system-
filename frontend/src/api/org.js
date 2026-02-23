import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const getDepartmentsAPI = async () => {
    const token = sessionStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/org/departments`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getTeamsAPI = async () => {
    const token = sessionStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/org/teams`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const createDepartmentAPI = async (data) => {
    const token = sessionStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/org/departments`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const createTeamAPI = async (data) => {
    const token = sessionStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/org/teams`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const updateDepartmentAPI = async (id, data) => {
    const token = sessionStorage.getItem('token');
    const response = await axios.put(`${API_URL}/api/org/departments/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const deleteDepartmentAPI = async (id) => {
    const token = sessionStorage.getItem('token');
    const response = await axios.delete(`${API_URL}/api/org/departments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};
