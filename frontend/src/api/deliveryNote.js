import axiosInstance from './axiosInstance';

export const createDeliveryNoteAPI = async (data) => {
    const response = await axiosInstance.post('/delivery-notes', data);
    return response.data;
};

export const getDeliveryNotesAPI = async () => {
    const response = await axiosInstance.get('/delivery-notes');
    return response.data;
};

export const getDeliveryNoteByIdAPI = async (id) => {
    const response = await axiosInstance.get(`/delivery-notes/${id}`);
    return response.data;
};
