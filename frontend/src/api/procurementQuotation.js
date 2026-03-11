import axiosInstance from "./axiosInstance";

export const getProcurementQuotationsAPI = async () => {
  try {
    const res = await axiosInstance.get("/api/procurement-quotations");
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getProcurementQuotationByIdAPI = async (id) => {
  try {
    const res = await axiosInstance.get(`/api/procurement-quotations/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createProcurementQuotationFromPRAPI = async (prId, payload = {}) => {
  try {
    const res = await axiosInstance.post(`/api/procurement-quotations/from-pr/${prId}`, payload);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const submitProcurementQuotationAPI = async (id) => {
  try {
    const res = await axiosInstance.patch(`/api/procurement-quotations/${id}/submit`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const approveProcurementQuotationAPI = async (id, payload = {}) => {
  try {
    const res = await axiosInstance.patch(`/api/procurement-quotations/${id}/approve`, payload);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const rejectProcurementQuotationAPI = async (id, payload = {}) => {
  try {
    const res = await axiosInstance.patch(`/api/procurement-quotations/${id}/reject`, payload);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const sendProcurementQuotationToSuppliersAPI = async (id) => {
  try {
    const res = await axiosInstance.patch(`/api/procurement-quotations/${id}/send`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

