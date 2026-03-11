import axiosInstance from './axiosInstance';

export const getGRNsAPI = async () => {
    const response = await axiosInstance.get('/api/grns');
    return response.data;
};

export const createGRNAPI = async (data) => {
    const response = await axiosInstance.post('/api/grns', data);
    return response.data;
};

export const getGRNByIdAPI = async (id) => {
    const response = await axiosInstance.get(`/api/grns/${id}`);
    return response.data;
};

export const verifyGRNAPI = async (id, comments = "") => {
    const response = await axiosInstance.patch(`/api/grns/${id}/verify`, { comments });
    return response.data;
};

export const rejectGRNAPI = async (id, reason = "") => {
    const response = await axiosInstance.patch(`/api/grns/${id}/reject`, { reason });
    return response.data;
};

export const exportGRNAPI = async (id, format = "pdf") => {
    const response = await axiosInstance.get(`/api/grns/${id}/export/${format}`, {
        responseType: "blob"
    });
    return response;
};
