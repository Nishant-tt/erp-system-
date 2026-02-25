import axiosInstance from './axiosInstance';

export const createOpportunityAPI = async (data) => {
    const response = await axiosInstance.post('/opportunities', data);
    return response.data;
};

export const getOpportunitiesAPI = async () => {
    const response = await axiosInstance.get('/opportunities');
    return response.data;
};

export const getOpportunityByIdAPI = async (id) => {
    const response = await axiosInstance.get(`/opportunities/${id}`);
    return response.data;
};

export const updateOpportunityAPI = async (id, data) => {
    const response = await axiosInstance.put(`/opportunities/${id}`, data);
    return response.data;
};
