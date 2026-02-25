import axiosInstance from './axiosInstance';

export const createLeadAPI = async (data) => {
    const response = await axiosInstance.post('/leads', data);
    return response.data;
};

export const getLeadsAPI = async () => {
    const response = await axiosInstance.get('/leads');
    return response.data;
};

export const getLeadByIdAPI = async (id) => {
    const response = await axiosInstance.get(`/leads/${id}`);
    return response.data;
};

export const updateLeadAPI = async (id, data) => {
    const response = await axiosInstance.put(`/leads/${id}`, data);
    return response.data;
};
