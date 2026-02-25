import axiosInstance from './axiosInstance';

export const loginAPI = async (email, password, financialYearId) => {
    try {
        const response = await axiosInstance.post('/api/auth/login', { email, password, financialYearId });
        return response.data;
    } catch (error) {
        console.error('Login API error:', error);
        throw error.response?.data || error;
    }
};

export const logoutAPI = async () => {
    try {
        const response = await axiosInstance.post('/api/auth/logout');
        return response.data;
    } catch (error) {
        console.error('Logout API error:', error);
        throw error.response?.data || error;
    }
};
