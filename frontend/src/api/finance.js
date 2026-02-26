import axiosInstance from './axiosInstance';

// Account APIs
export const getAccountsAPI = async (companyId) => {
    const response = await axiosInstance.get(`/api/accounts${companyId ? `?company=${companyId}` : ''}`);
    return response.data;
};

export const createAccountAPI = async (accountData) => {
    const response = await axiosInstance.post(`/api/accounts`, accountData);
    return response.data;
};

// Journal Entry APIs
export const getJournalEntriesAPI = async (params) => {
    const response = await axiosInstance.get(`/api/journal-entries`, { params });
    return response.data;
};

export const createJournalEntryAPI = async (entryData) => {
    const response = await axiosInstance.post(`/api/journal-entries`, entryData);
    return response.data;
};

export const getTrialBalanceAPI = async (companyId) => {
    const response = await axiosInstance.get(`/api/journal-entries/trial-balance?company=${companyId}`);
    return response.data;
};
