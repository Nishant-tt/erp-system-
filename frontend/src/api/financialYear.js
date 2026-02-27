import axios from 'axios';
import axiosInstance from './axiosInstance';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
console.log("financialYear API file loaded");
console.log("API_URL =", API_URL);
export const getFinancialYearsAPI = async () => {
    // Use plain axios for the public GET route to avoid the 401 redirect loop
    const response = await axios.get(`${API_URL}/api/financial-years`);
    return response.data;
};

export const createFinancialYearAPI = async (data) => {
    const response = await axiosInstance.post('/api/financial-years', data);
    return response.data;
};

export const updateFinancialYearAPI = async (id, data) => {
    const response = await axiosInstance.put(`/api/financial-years/${id}`, data);
    return response.data;
};

export const deleteFinancialYearAPI = async (id) => {
    const response = await axiosInstance.delete(`/api/financial-years/${id}`);
    return response.data;
};
