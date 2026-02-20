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
