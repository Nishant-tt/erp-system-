import axiosInstance from './axiosInstance';

export const getInvoicesAPI = async () => {
    const response = await axiosInstance.get('/api/invoices');
    return response.data;
};

export const createInvoiceAPI = async (data) => {
    const response = await axiosInstance.post('/api/invoices', data);
    return response.data;
};

export const getInvoiceByIdAPI = async (id) => {
    const response = await axiosInstance.get(`/api/invoices/${id}`);
    return response.data;
};
