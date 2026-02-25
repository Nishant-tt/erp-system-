import axiosInstance from './axiosInstance';

export const createSalesOrderAPI = async (data) => {
    const response = await axiosInstance.post('/sales-orders', data);
    return response.data;
};

export const getSalesOrdersAPI = async () => {
    const response = await axiosInstance.get('/sales-orders');
    return response.data;
};

export const getSalesOrderByIdAPI = async (id) => {
    const response = await axiosInstance.get(`/sales-orders/${id}`);
    return response.data;
};

export const updateSalesOrderStatusAPI = async (id, status) => {
    const response = await axiosInstance.put(`/sales-orders/${id}/status`, { status });
    return response.data;
};
