import axiosInstance from './axiosInstance';

export const getModulesAPI = async () => {
    try {
        const response = await axiosInstance.get('/api/modules');
        return response.data;
    } catch (error) {
        console.error('Modules API error:', error);
        throw error;
    }
};
