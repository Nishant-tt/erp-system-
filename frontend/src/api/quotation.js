import axiosInstance from './axiosInstance';

export const createQuotationAPI = async (data) => {
    const response = await axiosInstance.post('/api/quotations', data);
    return response.data;
};

export const getQuotationsAPI = async () => {
    const response = await axiosInstance.get('/api/quotations');
    return response.data;
};

export const getQuotationByIdAPI = async (id) => {
    const response = await axiosInstance.get(`/api/quotations/${id}`);
    return response.data;
};

export const updateQuotationStatusAPI = async (id, status) => {
    const response = await axiosInstance.put(`/api/quotations/${id}/status`, { status });
    return response.data;
};
