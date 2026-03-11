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

export const approveInvoiceAPI = async (id, comments, force = false) => {
    const response = await axiosInstance.patch(`/api/invoices/${id}/approve`, { comments, force });
    return response.data;
};

export const rejectInvoiceAPI = async (id, reason) => {
    const response = await axiosInstance.patch(`/api/invoices/${id}/reject`, { reason });
    return response.data;
};
