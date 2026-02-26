import axiosInstance from './axiosInstance';

export const createDeliveryNoteAPI = async (data) => {
    const response = await axiosInstance.post('/api/delivery-notes', data);
    return response.data;
};

export const getDeliveryNotesAPI = async () => {
    const response = await axiosInstance.get('/api/delivery-notes');
    return response.data;
};

export const getDeliveryNoteByIdAPI = async (id) => {
    const response = await axiosInstance.get(`/api/delivery-notes/${id}`);
    return response.data;
};
