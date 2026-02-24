import axiosInstance from './axiosInstance';

export const getDepartmentsAPI = async () => {
    const response = await axiosInstance.get('/api/org/departments');
    return response.data;
};

export const getTeamsAPI = async () => {
    const response = await axiosInstance.get('/api/org/teams');
    return response.data;
};

export const createDepartmentAPI = async (data) => {
    const response = await axiosInstance.post('/api/org/departments', data);
    return response.data;
};

export const createTeamAPI = async (data) => {
    const response = await axiosInstance.post('/api/org/teams', data);
    return response.data;
};

export const updateDepartmentAPI = async (id, data) => {
    const response = await axiosInstance.put(`/api/org/departments/${id}`, data);
    return response.data;
};

export const deleteDepartmentAPI = async (id) => {
    const response = await axiosInstance.delete(`/api/org/departments/${id}`);
    return response.data;
};
