import axiosInstance from './axiosInstance';

export const getPOsAPI = async () => {
    const response = await axiosInstance.get('/api/pos');
    return response.data;
};

export const createPOAPI = async (data) => {
    const response = await axiosInstance.post('/api/pos', data);
    return response.data;
};

export const getPOByIdAPI = async (id) => {
    const response = await axiosInstance.get(`/api/pos/${id}`);
    return response.data;
};

export const submitPOForApprovalAPI = async (id) => {
    const response = await axiosInstance.patch(`/api/pos/${id}/submit`);
    return response.data;
};

export const approvePOAPI = async (id, comments) => {
    const response = await axiosInstance.patch(`/api/pos/${id}/approve`, { comments });
    return response.data;
};

export const rejectPOAPI = async (id, reason) => {
    const response = await axiosInstance.patch(`/api/pos/${id}/reject`, { reason });
    return response.data;
};

// Admin-only operational override
export const updatePOStatusAPI = async (id, status) => {
    const response = await axiosInstance.put(`/api/pos/${id}/status`, { status });
    return response.data;
};

export const exportPOAPI = async (id, format = "pdf") => {
    const response = await axiosInstance.get(`/api/pos/${id}/export/${format}`, {
        responseType: "blob"
    });
    return response;
};
