import axiosInstance from './axiosInstance';

export const getProfileAPI = async () => {
    const response = await axiosInstance.get('/api/users/profile');
    return response.data;
};

export const getUsersAPI = async () => {
    const response = await axiosInstance.get('/api/users');
    return response.data;
};

export const updateProfileAPI = async (formData) => {
    const response = await axiosInstance.put('/api/users/profile', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const createUserAPI = async (userData) => {
    const response = await axiosInstance.post('/api/users', userData);
    return response.data;
};

export const updateUserAPI = async (id, userData) => {
    const response = await axiosInstance.put(`/api/users/${id}`, userData);
    return response.data;
};

export const deleteUserAPI = async (id) => {
    const response = await axiosInstance.delete(`/api/users/${id}`);
    return response.data;
};
