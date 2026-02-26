import axiosInstance from './axiosInstance';

export const createSalesInvoiceAPI = async (data) => {
    const response = await axiosInstance.post('/api/sales-invoices', data);
    return response.data;
};

export const getSalesInvoicesAPI = async () => {
    const response = await axiosInstance.get('/api/sales-invoices');
    return response.data;
};

export const getSalesInvoiceByIdAPI = async (id) => {
    const response = await axiosInstance.get(`/api/sales-invoices/${id}`);
    return response.data;
};

export const updateSalesInvoiceAPI = async (id, data) => {
    const response = await axiosInstance.put(`/api/sales-invoices/${id}`, data);
    return response.data;
};

export const deleteSalesInvoiceAPI = async (id) => {
    const response = await axiosInstance.delete(`/api/sales-invoices/${id}`);
    return response.data;
};
