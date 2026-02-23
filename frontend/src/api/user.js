import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const getProfileAPI = async () => {
    try {
        const token = sessionStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/users/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Profile API fetch error:', error);
        throw error;
    }
};

export const getUsersAPI = async () => {
    try {
        const token = sessionStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/users`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Fetch users error:', error);
        throw error;
    }
};

export const updateProfileAPI = async (formData) => {
    try {
        const token = sessionStorage.getItem('token');
        const response = await axios.put(`${API_URL}/api/users/profile`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Profile update error:', error);
        throw error;
    }
};

export const createUserAPI = async (userData) => {
    try {
        const token = sessionStorage.getItem('token');
        const response = await axios.post(`${API_URL}/api/users`, userData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Create user error:', error);
        throw error;
    }
};

export const updateUserAPI = async (id, userData) => {
    try {
        const token = sessionStorage.getItem('token');
        const response = await axios.put(`${API_URL}/api/users/${id}`, userData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Update user error:', error);
        throw error;
    }
};

export const deleteUserAPI = async (id) => {
    try {
        const token = sessionStorage.getItem('token');
        const response = await axios.delete(`${API_URL}/api/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Delete user error:', error);
        throw error;
    }
};
