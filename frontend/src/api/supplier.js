import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const getSuppliersAPI = async () => {
    const token = sessionStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/suppliers`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const createSupplierAPI = async (data) => {
    const token = sessionStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/suppliers`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const updateSupplierAPI = async (id, data) => {
    const token = sessionStorage.getItem('token');
    const response = await axios.put(`${API_URL}/api/suppliers/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const deleteSupplierAPI = async (id) => {
    const token = sessionStorage.getItem('token');
    const response = await axios.delete(`${API_URL}/api/suppliers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};
