import axiosInstance from './axiosInstance';

export const getItemsAPI = async () => {
    const response = await axiosInstance.get('/api/items');
    return response.data;
};

export const createItemAPI = async (data) => {
    const response = await axiosInstance.post('/api/items', data);
    return response.data;
};

export const updateItemAPI = async (id, data) => {
    const response = await axiosInstance.put(`/api/items/${id}`, data);
    return response.data;
};

export const deleteItemAPI = async (id) => {
    const response = await axiosInstance.delete(`/api/items/${id}`);
    return response.data;
};
