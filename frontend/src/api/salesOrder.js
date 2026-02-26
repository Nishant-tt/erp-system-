import axiosInstance from './axiosInstance';

export const createSalesOrderAPI = async (data) => {
    const response = await axiosInstance.post('/api/sales-orders', data);
    return response.data;
};

export const getSalesOrdersAPI = async () => {
    const response = await axiosInstance.get('/api/sales-orders');
    return response.data;
};

export const getSalesOrderByIdAPI = async (id) => {
    const response = await axiosInstance.get(`/api/sales-orders/${id}`);
    return response.data;
};

export const updateSalesOrderStatusAPI = async (id, status) => {
    const response = await axiosInstance.put(`/api/sales-orders/${id}/status`, { status });
    return response.data;
};
