import axiosInstance from './axiosInstance';

export const getCustomersAPI = async () => {
    const response = await axiosInstance.get('/api/customers');
    return response.data;
};

export const createCustomerAPI = async (data) => {
    const response = await axiosInstance.post('/api/customers', data);
    return response.data;
};

export const updateCustomerAPI = async (id, data) => {
    const response = await axiosInstance.put(`/api/customers/${id}`, data);
    return response.data;
};

export const deleteCustomerAPI = async (id) => {
    const response = await axiosInstance.delete(`/api/customers/${id}`);
    return response.data;
};
