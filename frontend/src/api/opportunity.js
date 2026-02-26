import axiosInstance from './axiosInstance';

export const createOpportunityAPI = async (data) => {
    const response = await axiosInstance.post('/api/opportunities', data);
    return response.data;
};

export const getOpportunitiesAPI = async () => {
    const response = await axiosInstance.get('/api/opportunities');
    return response.data;
};

export const getOpportunityByIdAPI = async (id) => {
    const response = await axiosInstance.get(`/api/opportunities/${id}`);
    return response.data;
};

export const updateOpportunityAPI = async (id, data) => {
    const response = await axiosInstance.put(`/api/opportunities/${id}`, data);
    return response.data;
};
