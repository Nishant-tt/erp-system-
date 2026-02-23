import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const getRolesAPI = async () => {
    const token = sessionStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/roles`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const createRoleAPI = async (data) => {
    const token = sessionStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/roles`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const updateRoleAPI = async (id, roleData) => {
    const token = sessionStorage.getItem('token');
    const response = await axios.put(`${API_URL}/api/roles/${id}`, roleData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const deleteRoleAPI = async (id) => {
    const token = sessionStorage.getItem('token');
    const response = await axios.delete(`${API_URL}/api/roles/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};
