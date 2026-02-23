import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const getPRsAPI = async () => {
    const token = sessionStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/prs`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const createPRAPI = async (data) => {
    const token = sessionStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/prs`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const updatePRAPI = async (id, data) => {
    const token = sessionStorage.getItem('token');
    const response = await axios.put(`${API_URL}/api/prs/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const submitPRAPI = async (id) => {
    const token = sessionStorage.getItem('token');
    const response = await axios.patch(`${API_URL}/api/prs/${id}/submit`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const approvePRAPI = async (id, comments) => {
    const token = sessionStorage.getItem('token');
    const response = await axios.patch(`${API_URL}/api/prs/${id}/approve`, { comments }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const rejectPRAPI = async (id, reason) => {
    const token = sessionStorage.getItem('token');
    const response = await axios.patch(`${API_URL}/api/prs/${id}/reject`, { reason }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};
export const getPRByIdAPI = async (id) => {
    const token = sessionStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/prs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};
