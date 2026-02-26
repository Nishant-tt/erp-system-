import axiosInstance from './axiosInstance';

export const createCustomerPaymentAPI = async (data) => {
    const response = await axiosInstance.post('/api/customer-payments', data);
    return response.data;
};

export const getCustomerPaymentsAPI = async () => {
    const response = await axiosInstance.get('/api/customer-payments');
    return response.data;
};

export const getCustomerPaymentByIdAPI = async (id) => {
    const response = await axiosInstance.get(`/api/customer-payments/${id}`);
    return response.data;
};
