import axiosInstance from './axiosInstance';

export const getRolesAPI = async () => {
    const response = await axiosInstance.get('/api/roles');
    return response.data;
};

export const createRoleAPI = async (data) => {
    const response = await axiosInstance.post('/api/roles', data);
    return response.data;
};

export const updateRoleAPI = async (id, roleData) => {
    const response = await axiosInstance.put(`/api/roles/${id}`, roleData);
    return response.data;
};

export const deleteRoleAPI = async (id) => {
    const response = await axiosInstance.delete(`/api/roles/${id}`);
    return response.data;
};
