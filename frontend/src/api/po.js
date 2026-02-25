import axiosInstance from './axiosInstance';

export const getPOsAPI = async () => {
    const response = await axiosInstance.get('/api/pos');
    return response.data;
};

export const createPOAPI = async (data) => {
    const response = await axiosInstance.post('/api/pos', data);
    return response.data;
};

export const getPOByIdAPI = async (id) => {
    const response = await axiosInstance.get(`/api/pos/${id}`);
    return response.data;
};

export const updatePOStatusAPI = async (id, status) => {
    const response = await axiosInstance.put(`/api/pos/${id}/status`, { status });
    return response.data;
};
