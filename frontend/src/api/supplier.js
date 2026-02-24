import axiosInstance from './axiosInstance';

export const getSuppliersAPI = async () => {
    const response = await axiosInstance.get('/api/suppliers');
    return response.data;
};

export const createSupplierAPI = async (data) => {
    const response = await axiosInstance.post('/api/suppliers', data);
    return response.data;
};

export const updateSupplierAPI = async (id, data) => {
    const response = await axiosInstance.put(`/api/suppliers/${id}`, data);
    return response.data;
};

export const deleteSupplierAPI = async (id) => {
    const response = await axiosInstance.delete(`/api/suppliers/${id}`);
    return response.data;
};
