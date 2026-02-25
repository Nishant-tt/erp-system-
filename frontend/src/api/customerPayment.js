import axiosInstance from './axiosInstance';

export const createCustomerPaymentAPI = async (data) => {
    const response = await axiosInstance.post('/customer-payments', data);
    return response.data;
};

export const getCustomerPaymentsAPI = async () => {
    const response = await axiosInstance.get('/customer-payments');
    return response.data;
};

export const getCustomerPaymentByIdAPI = async (id) => {
    const response = await axiosInstance.get(`/customer-payments/${id}`);
    return response.data;
};
