import axiosInstance from './axiosInstance';

export const getPRsAPI = async () => {
    const response = await axiosInstance.get('/api/prs');
    return response.data;
};

export const createPRAPI = async (data) => {
    const response = await axiosInstance.post('/api/prs', data);
    return response.data;
};

export const updatePRAPI = async (id, data) => {
    const response = await axiosInstance.put(`/api/prs/${id}`, data);
    return response.data;
};

export const submitPRAPI = async (id) => {
    const response = await axiosInstance.patch(`/api/prs/${id}/submit`, {});
    return response.data;
};

export const approvePRAPI = async (id, comments) => {
    const response = await axiosInstance.patch(`/api/prs/${id}/approve`, { comments });
    return response.data;
};

export const rejectPRAPI = async (id, reason) => {
    const response = await axiosInstance.patch(`/api/prs/${id}/reject`, { reason });
    return response.data;
};

export const getPRByIdAPI = async (id) => {
    const response = await axiosInstance.get(`/api/prs/${id}`);
    return response.data;
};

export const exportPRAPI = async (id, format = "pdf") => {
    const response = await axiosInstance.get(`/api/prs/${id}/export/${format}`, {
        responseType: "blob"
    });
    return response;
};
