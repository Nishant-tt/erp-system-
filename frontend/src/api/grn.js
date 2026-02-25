import axiosInstance from './axiosInstance';

export const getGRNsAPI = async () => {
    const response = await axiosInstance.get('/api/grns');
    return response.data;
};

export const createGRNAPI = async (data) => {
    const response = await axiosInstance.post('/api/grns', data);
    return response.data;
};

export const getGRNByIdAPI = async (id) => {
    const response = await axiosInstance.get(`/api/grns/${id}`);
    return response.data;
};
