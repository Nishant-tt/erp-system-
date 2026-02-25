import axiosInstance from './axiosInstance';

export const getCompanyAPI = async () => {
    const response = await axiosInstance.get('/api/company');
    return response.data;
};

export const updateCompanyAPI = async (data) => {
    const response = await axiosInstance.put('/api/company', data);
    return response.data;
};
