import axiosInstance from './axiosInstance';

export const getPaymentsAPI = async () => {
    const response = await axiosInstance.get('/api/payments');
    return response.data;
};

export const createPaymentAPI = async (data) => {
    const response = await axiosInstance.post('/api/payments', data);
    return response.data;
};
