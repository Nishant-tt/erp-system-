import axiosInstance from './axiosInstance';

export const createQuotationAPI = async (data) => {
    const response = await axiosInstance.post('/quotations', data);
    return response.data;
};

export const getQuotationsAPI = async () => {
    const response = await axiosInstance.get('/quotations');
    return response.data;
};

export const getQuotationByIdAPI = async (id) => {
    const response = await axiosInstance.get(`/quotations/${id}`);
    return response.data;
};

export const updateQuotationStatusAPI = async (id, status) => {
    const response = await axiosInstance.put(`/quotations/${id}/status`, { status });
    return response.data;
};
